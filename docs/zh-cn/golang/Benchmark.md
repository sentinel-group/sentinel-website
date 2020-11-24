# Benchmark
## 测试环境

CPU：Intel(R) Xeon(R) CPU E5-2640 v3 @ 2.60GHz (32 Cores)
OS：Red Hat 4.8.2-16
Golang version: 1.14.3

## 吞吐量对比

测试单协程/并发模式下接入 Sentinel 与不接入 Sentinel 吞吐量的对比。我们通过执行一些 CPU 密集型操作（小数组排序）来模拟不同 QPS 下的情况。测试例子参考：[Benchmark](https://github.com/louyuting/sentinel-golang/tree/add_benchmark/tests)

### 单协程吞吐量

```
Benchmark_Single_Directly_50    	 4081059	       882 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_50    	 4075447	       886 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_50    	 4065984	       884 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_50   	 2508170	      1434 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_50   	 2508332	      1435 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_50   	 2506646	      1437 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_100   	 1504512	      2391 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_100   	 1506342	      2393 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_100   	 1500378	      2393 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_100  	 1224729	      2937 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_100  	 1225106	      3257 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_100  	 1168003	      2935 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_200   	  613916	      5899 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_200   	  609230	      5915 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_200   	  612487	      5910 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_200  	  556461	      6473 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_200  	  561085	      6477 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_200  	  550544	      6461 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_500   	  190442	     18859 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_500   	  185095	     18902 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_500   	  191236	     18889 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_500  	  185674	     19426 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_500  	  185353	     19444 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_500  	  185371	     19487 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_1000  	   86101	     41642 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_1000  	   86492	     41760 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_1000  	   86415	     41769 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_1000 	   83931	     42339 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_1000 	   84270	     42321 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_1000 	   85328	     42420 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_2000  	   39504	     90540 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_2000  	   39612	     90218 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_Directly_2000  	   39786	     90401 ns/op	      32 B/op	       1 allocs/op
Benchmark_Single_StatEntry_2000 	   39234	     91519 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_2000 	   39418	     91123 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_StatEntry_2000 	   39360	     91208 ns/op	     128 B/op	       4 allocs/op
Benchmark_Single_Directly_4000  	   18218	    197592 ns/op	      33 B/op	       1 allocs/op
Benchmark_Single_Directly_4000  	   18194	    197011 ns/op	      33 B/op	       1 allocs/op
Benchmark_Single_Directly_4000  	   18213	    197554 ns/op	      33 B/op	       1 allocs/op
Benchmark_Single_StatEntry_4000 	   18105	    198295 ns/op	     130 B/op	       4 allocs/op
Benchmark_Single_StatEntry_4000 	   18162	    198432 ns/op	     130 B/op	       4 allocs/op
Benchmark_Single_StatEntry_4000 	   18162	    198686 ns/op	     129 B/op	       4 allocs/op
```

这里取三组数据的中位值：

| 数组长度 | Baseline(QPS) | With Sentinel(QPS) | 性能损耗 |
|--|--|--|--|
| 50 | 1131221 | 696864 | 38.4% |
| 100 | 417885 | 340483 | 18.5% |
| 200 | 169204 | 154487 |  8.7% |
| 500 |  52940 |  51429 |  2.9% |
| 1000 | 23946 |  23618 |  1.4% |
| 2000 | 11061 |  10963 |  0.9% |
| 4000 |  5061 |   5039 |  0.4% |

可以看到在单机 QPS 非常大的时候（16W+），Sentinel 带来的性能损耗会比较大。这种情况业务逻辑本身的耗时非常小，而 Sentinel 一系列的统计、检查操作会消耗一定的时间。常见的场景有缓存读取操作。

而单机 QPS 在 6W 以下的时候，Sentinel 的性能损耗就比较小了，对大多数场景来说都适用。

## 多协程影响

测试排序数组长度是200时候，并发4/8/16/32/32+协程并发下的性能：

| 并发数 | With Sentinel(QPS) | 性能 |
|--|--|--|
| 1  | 154487 | 100%  |
| 4  | 586510 | 379% |
| 8  | 685871 | 443% |
| 16 |1324503 | 857% |
| 32 |1449275 | 938% |

32并发以上基本没有提升了。

## 内存占用情况

测试场景：6000 个资源循环跑（即单机的极端场景，目前最多支持 6000 个 entry）

* 单协程不断循环运行：内存占用约 30 MB
* 8个协程不断循环运行：内存占用约 36 MB

