# Sentinel Go 毫秒级统计数据结构揭秘

## 介绍

随着微服务的流行，服务和服务之间的稳定性变得越来越重要。在2020年，Sentinel 社区推出 [Sentinel Go 版本](https://github.com/alibaba/sentinel-golang)，朝着云原生方向演进。Sentinel Go 作为流量治理组件，主要以流量为切入点，从流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护等多个维度来帮助开发者保障微服务的稳定性。

无论是流量控制还是熔断降级，实现的核心思想都是通过统计一段时间内的指标数据（请求数/错误数等），然后根据预选设定的阈值判断是否应该进行流量管控

那么如何存储并统计这一段时间内的指标数据则是核心关键，本文将揭秘 Sentienl Go 是如何实现的**毫秒级指标数据存储与统计。**

## 固定窗口
在正式介绍之前，先简单介绍一下固定窗口的算法（也叫计数器算法）是实现流量控制比较简单的一种方式。其他常见的还有很多例如滑动时间窗口算法，漏桶算法，令牌桶算法等等。

固定窗口算法一般是通过原子操作将请求在统计周期内进行累加，然后当请求数大于阈值时进行限流。实现代码：

```go
var (
    counter    int64 //计数
    intervalMs int64 = 1000 //窗口长度(1S)
    threshold  int64 = 2 //限流阈值
    startTime        = time.Now().UnixMilli() //窗口开始时间
)

func main() {
    for i := 0; i < 10; i++ {
       if tryAcquire() {
          fmt.Println("成功请求", time.Now().Unix())
      }
   }
}

func tryAcquire() bool {
    if time.Now().UnixMilli()-atomic.LoadInt64(&startTime) > intervalMs {
       atomic.StoreInt64(&startTime, time.Now().UnixMilli())
       atomic.StoreInt64(&counter, 0)
   }
    return atomic.AddInt64(&counter, 1) <= threshold
}
```
固定窗口的限流在实现上看起来比较简单容易，但是也有一些问题，最典型的就是“边界”问题。

如下图，统计周期为1S,限流阈值是2的情况下，假设4次请求恰好“跨越”了固定的时间窗口，如红色的1S时间窗口所示会有四次请求，明显不符合限流的预期：

![sentinel-go-data-structure-fixed-window.png](img/sentinel-go-data-structure-fixed-window.png)

## 滑动时间窗口

在滑动时间窗口算法中可以解决固定窗口算法的边界问题，在滑动窗口算法中通常有两个比较重要的概念

- 统计周期：例如想限制5S的请求数不能超过100次，那么5S就是统计周期
- 窗口(格子)的大小：一个周期内会有多个窗口(格子)进行指标（例如请求数）的统计，长度相等的统计周期，格子的数量越多，统计的越精确

如下所示，统计周期为1s，每个周期内分为两个格子，每个格子的长度是500ms：

![sentinel-go-data-structure-sliding-window.png](img/sentinel-go-data-structure-sliding-window.png)

在滑动窗口中统计周期以及窗口的大小，需要根据业务情况进行设定。

* **统计周期一致，窗口大小不一致**：窗口越大统计精准度越低，但并发性能好；窗口越小，统计精准度越高，但并发性能随之降低
* **统计周期不一致，窗口大小一致**：周期越长抗流量脉冲情况越好

## 统计结构

下面将详细介绍 Sentinel-Go 是如何使用滑动时间窗口高效的存储和统计指标数据的。

### 窗口结构

在滑动时间窗口中时间很重要。每个窗口（BucketWrap）的组成是由一个开始时间和一个抽象的统计结构

```go
type BucketWrap struct {
   // BucketStart represents start timestamp of this statistic bucket wrapper.
   BucketStart uint64
   // Value represents the actual data structure of the metrics (e.g. MetricBucket).
   Value atomic.Value
}
```
- **开始时间**：当前格子的的起始时间
- **统计结构**：存储指标数据，原子操作并发安全

如下:统计周期1s,每个窗口的长度是200ms

![sentinel-go-data-structure-window-struct.png](img/sentinel-go-data-structure-window-struct.png)

**指标数据:**

1. pass: 表示到来的数量，即此刻通过 Sentinel-Go 规则的流量数量
2. block: 表示被拦截的流量数量
3. complete: 表示完成的流量数量，包含正常结束和异常结束的情况
4. error: 表示错误的流量数量（熔断场景使用）
5. rt： 单次请求的request time
6. total：暂时无用

### 原子时间轮
如上：整个统计周期内有多个时间窗口，在 Sentinel Go 中统计周期是由slice实现的，每个元素对应一个窗口。

在上面介绍了为了解决边界问题，滑动时间窗口统计的过程需要向右滑动。随时时间的推移，无限的向右滑动，势必会让slice持续的扩张，导致slice的容量“无限”增长

![sentinel-go-data-structure-slice.png](img/sentinel-go-data-structure-slice.png)

为了解决这个问题，在 Sentinel Go 中实现了一个**时间轮**的概念，通过固定slice长度将过期的时间窗口重置，节省空间。

![sentinel-go-data-structure-time-round.png](img/sentinel-go-data-structure-time-round.png)

如下：原子时间轮数据结构

```go
type AtomicBucketWrapArray struct {
   // The base address for real data array
   base unsafe.Pointer // 窗口数组首元素地址
   // The length of slice(array), it can not be modified.
   length int // 窗口数组的长度
   data   []*BucketWrap //窗口数组
}
```

#### 初始化

1. 根据当前时间计算出当前时间对应的窗口的startime，并得到当前窗口对应的位置：

```go
// 计算开始时间
func calculateStartTime(now uint64, bucketLengthInMs uint32) uint64 {
   return now - (now % uint64(bucketLengthInMs))
}
// 窗口下标位置
idx := int((now / uint64(bucketLengthInMs)) % uint64(len))
```
![sentinel-go-data-structure-index.png](img/sentinel-go-data-structure-index.png)

2. 初始化窗口数据结构（BucketWrap）

```go
for i := idx; i <= len-1; i++ {
   ww := &BucketWrap{
      BucketStart: startTime,
      Value:       atomic.Value{},
   }
   ww.Value.Store(generator.NewEmptyBucket())
   ret.data[i] = ww
   startTime += uint64(bucketLengthInMs)
}
for i := 0; i < idx; i++ {
   ww := &BucketWrap{
      BucketStart: startTime,
      Value:       atomic.Value{},
   }
   ww.Value.Store(generator.NewEmptyBucket())
   ret.data[i] = ww
   startTime += uint64(bucketLengthInMs)
}
```

![sentinel-go-data-structure-init.png](img/sentinel-go-data-structure-init.png)

3. 将窗口数组首元素地址设置到原子时间轮：

```go
// calculate base address for real data array
sliHeader := (*util.SliceHeader)(unsafe.Pointer(&ret.data))
ret.base = unsafe.Pointer((**BucketWrap)(unsafe.Pointer(sliHeader.Data)))
```

如果对unsafe.Pointer和slice熟悉的同学，对于这段代码不难理解。这里通过unsafe.Pointer将底层slice首元素（第一个窗口）地址设置到原子时间轮中。这么做的原因主要是实现对时间轮中的元素（窗口）进行**原子无锁的读取和更新。**

#### 窗口获取&窗口替换

如何在并发安全的情况下读取窗口和对窗口进行替换（时间轮涉及到对窗口更新操作），代码如下：

```go
// 获取对应窗口
func (aa *AtomicBucketWrapArray) get(idx int) *BucketWrap {
   // aa.elementOffset(idx) return the secondary pointer of BucketWrap, which is the pointer to the aa.data[idx]
   // then convert to (*unsafe.Pointer)
   if offset, ok := aa.elementOffset(idx); ok {
      return (*BucketWrap)(atomic.LoadPointer((*unsafe.Pointer)(offset)))
   }
   return nil
}

// 替换对应窗口
func (aa *AtomicBucketWrapArray) compareAndSet(idx int, except, update *BucketWrap) bool {
   // aa.elementOffset(idx) return the secondary pointer of BucketWrap, which is the pointer to the aa.data[idx]
   // then convert to (*unsafe.Pointer)
   // update secondary pointer
   if offset, ok := aa.elementOffset(idx); ok {
      return atomic.CompareAndSwapPointer((*unsafe.Pointer)(offset), unsafe.Pointer(except), unsafe.Pointer(update))
   }
   return false
}

// 获取对应窗口的地址
func (aa *AtomicBucketWrapArray) elementOffset(idx int) (unsafe.Pointer, bool) {
   if idx >= aa.length || idx < 0 {
      logging.Error(errors.New("array index out of bounds"),
         "array index out of bounds in AtomicBucketWrapArray.elementOffset()",
         "idx", idx, "arrayLength", aa.length)
      return nil, false
   }
   basePtr := aa.base
   return unsafe.Pointer(uintptr(basePtr) + uintptr(idx)*unsafe.Sizeof(basePtr)), true
}
```

**获取窗口**:

1. 在get func中接收根据当前时间计算出的窗口对应下标位置
2. 根据下标位置在elementOffset func中，首先将底层的slice首元素地址转换成uintptr，然后将窗口对应下标*对应的指针字节大小即可以得到对应窗口元素的地址
3. 将对应窗口地址转换成时间窗口（`*BucketWarp`）即可

![sentinel-go-data-structure-slice-calculate.png](img/sentinel-go-data-structure-slice-calculate.png)

**窗口更新**：和获取窗口一样，获取到对应下标位置的窗口地址，然后利用 `atomic.CompareAndSwapPointer` 进行 CAS 更新，将新的窗口指针地址更新到底层数组中。

### 滑动窗口

在原子时间轮中提供了对窗口读取以及更新的操作。那么**在什么时机触发更新以及如何滑动呢？**

#### 滑动

所谓滑动就是根据当前时间找到整个统计周期的所有窗口中的数据。例如在限流场景下，我们需要获取统计周期内的所有pass的流量，从而来判断当前流量是否应该被限流。

核心代码如下：
```go
// 根据当前时间获取周期内的所有窗口
func (m *SlidingWindowMetric) getSatisfiedBuckets(now uint64) []*BucketWrap {
   start, end := m.getBucketStartRange(now)
   satisfiedBuckets := m.real.ValuesConditional(now, func(ws uint64) bool {
      return ws >= start && ws <= end
   })
   return satisfiedBuckets
}


// 根据当前时间获取整个周期对应的窗口的开始时间和结束时间
func (m *SlidingWindowMetric) getBucketStartRange(timeMs uint64) (start, end uint64) {
   curBucketStartTime := calculateStartTime(timeMs, m.real.BucketLengthInMs())
   end = curBucketStartTime
   start = end - uint64(m.intervalInMs) + uint64(m.real.BucketLengthInMs())
   return
}

// 匹配符合条件的窗口
func (la *LeapArray) ValuesConditional(now uint64, predicate base.TimePredicate) []*BucketWrap {
   if now <= 0 {
      return make([]*BucketWrap, 0)
   }
   ret := make([]*BucketWrap, 0, la.array.length)
   for i := 0; i < la.array.length; i++ {
      ww := la.array.get(i)
      if ww == nil || la.isBucketDeprecated(now, ww) || !predicate(atomic.LoadUint64(&ww.BucketStart)) {
         continue
      }
      ret = append(ret, ww)
   }
   return ret
}
```

如下图所示：统计周期=1000ms（跨两个格子），now=1300时 计算出 start=500,end=1000:

![sentinel-go-data-structure-start.png](img/sentinel-go-data-structure-start.png)

那么在计算周期内的pass数量时，会根据如下条件遍历格子，也就会找到开始时间是500和1000的两个格子，那么统计的时候1000的这个格子中的数据自然也会被统计到。（当前时间1300，在1000的这个格子中）

```go
satisfiedBuckets := m.real.ValuesConditional(now, func(ws uint64) bool { 
 		return ws >= start && ws <= end 
 	}) 
```

#### 更新

每次流量经过时都会进行相应的指标存储，在存储时会先获取对应的窗口，然后会根据窗口的开始时间进行对比，如果过期则进行窗口重置。

如下图：根据窗口开始时间匹配发现0号窗口已过期：

![sentinel-go-data-structure-overdue.png](img/sentinel-go-data-structure-overdue.png)

如下图：重置窗口的开始时间和统计指标：

![sentinel-go-data-structure-reset.png](img/sentinel-go-data-structure-reset.png)

核心代码：

```go
func (la *LeapArray) currentBucketOfTime(now uint64, bg BucketGenerator) (*BucketWrap, error) {
   // 计算当前时间对应的窗口下标
   idx := la.calculateTimeIdx(now)
   // 计算当前时间对应的窗口的开始时间
   bucketStart := calculateStartTime(now, la.bucketLengthInMs)

   for {
     // 获取旧窗口
      old := la.array.get(idx)
      // 如果旧窗口==nil则初始化(正常不会执行这部分代码)
      if old == nil {
         newWrap := &BucketWrap{
            BucketStart: bucketStart,
            Value:       atomic.Value{},
         }
         newWrap.Value.Store(bg.NewEmptyBucket())
         if la.array.compareAndSet(idx, nil, newWrap) {
            return newWrap, nil
         } else {
            runtime.Gosched()
         }
      // 如果本次计算的开始时间等于旧窗口的开始时间，则认为窗口没有过期，直接返回
      } else if bucketStart == atomic.LoadUint64(&old.BucketStart) {
         return old, nil
      //  如果本次计算的开始时间大于旧窗口的开始时间，则认为窗口过期尝试重置
      } else if bucketStart > atomic.LoadUint64(&old.BucketStart) {
         if la.updateLock.TryLock() {
            old = bg.ResetBucketTo(old, bucketStart)
            la.updateLock.Unlock()
            return old, nil
         } else {
            runtime.Gosched()
         }
        ......
      } 
}
```

## 总结
通过上面的介绍可以了解到在 Sentienl Go 中实现底层指标的统计代码量并不多，本质是通过“时间轮”进行指标的数据统计和存储，在时间轮中借鉴slice的底层实现利用unsafe.Pointer和atomic配合对时间轮进行无锁的原子操作，极大的提升了性能。

Sentinel Go 的整体的数据结构图：

![sentinel-go-data-structure-all.png](img/sentinel-go-data-structure-all.png)

### 作者介绍
张斌斌（GitHub 账号：binbin0325，公众号：柠檬汁Code）Sentinel-Golang Committer 、ChaosBlade Committer 、 Nacos PMC 、Apache Dubbo-Go Committer。目前主要关注于混沌工程、中间件以及云原生方向。

### 文章参考

* [惜暮大佬巨作【unsafe.Pointer使用原则】](https://louyuting.blog.csdn.net/article/details/103826830)

