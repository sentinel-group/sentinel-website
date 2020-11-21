@[TOC]

# 测试环境
- Sentinel Go 1.0
- CPU: 32核
- 内存: 64G
- Go Version: 1.15.5

# Entry benchmark
测试Sentinel Go核心框架的性能，测试只包括Sentinel Go的Chain以及两个统计相关的slot:

测试用例：[https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/entry/entry_benchmark_test.go](https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/entry/entry_benchmark_test.go)

测试命令： 
```
cd sentinel-golang/tests/benchmark/entry
go test -bench=.  -count=3 ./entry_benchmark_test.go
```

测试结果：
```
Benchmark_Entry_Concurrency_1-32     	 4262185	       269 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_1-32     	 4275895	       263 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_1-32     	 4384717	       267 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_4-32     	 4457552	       284 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_4-32     	 4281831	       276 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_4-32     	 4088697	       276 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_8-32     	 4099658	       297 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_8-32     	 4068072	       281 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_8-32     	 4069347	       300 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_16-32    	 3969878	       286 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_16-32    	 3910789	       284 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_16-32    	 3917329	       286 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_32-32    	 3726696	       308 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_32-32    	 4106005	       293 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_32-32    	 3656160	       295 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_48-32    	 3737134	       303 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_48-32    	 3670418	       296 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_48-32    	 3593373	       290 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_64-32    	 3882510	       275 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_64-32    	 3589198	       309 ns/op	     128 B/op	       4 allocs/op
Benchmark_Entry_Concurrency_64-32    	 3638198	       288 ns/op	     128 B/op	       4 allocs/op
```

并发下整个Sentinel 框架损耗的性能大概在 360W QPS.

# Isolation module benchmark
测试Sentinel Go 的isolation module的性能(这里是包含了核心统计相关slot)。

测试用例：[https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/isolation/isolation_slot_benchmark_test.go](https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/isolation/isolation_slot_benchmark_test.go)

测试命令： 
```
cd sentinel-golang/tests/benchmark/isolation
go test -bench=.  -count=3 ./isolation_slot_benchmark_test.go
```

测试结果：
```
Benchmark_IsolationSlotCheck_Loop-32             	  896114	      1149 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Loop-32             	  996876	      1159 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Loop-32             	 1113156	      1120 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency4-32     	 3263098	       311 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency4-32     	 3729183	       309 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency4-32     	 3790057	       320 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency8-32     	 3779985	       323 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency8-32     	 3709964	       324 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency8-32     	 3645986	       328 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency16-32    	 3475914	       339 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency16-32    	 3546073	       328 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency16-32    	 3583573	       334 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency32-32    	 3597349	       340 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency32-32    	 3533754	       345 ns/op	     120 B/op	       4 allocs/op
Benchmark_IsolationSlotCheck_Concurrency32-32    	 3417442	       333 ns/op	     120 B/op	       4 allocs/op
```
并发下，isolation的性能大概在310W QPS.

# flow module benchmark
测试Sentinel Go 的flow module的性能(这里是包含了核心统计相关slot)。

测试用例：[https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/flow/flow_benchmark_test.go](https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/flow/flow_benchmark_test.go)

测试命令： 
```
cd sentinel-golang/tests/benchmark/flow
go test -bench=. -count=3 ./flow_benchmark_test.go
```

测试结果：
```
Benchmark_DirectReject_SlotCheck_4-32     	 2628055	       411 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_4-32     	 2807998	       425 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_4-32     	 2632394	       449 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_8-32     	 2607313	       464 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_8-32     	 2628471	       455 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_8-32     	 2628584	       450 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_16-32    	 2578561	       473 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_16-32    	 2509540	       467 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_16-32    	 2564976	       472 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_32-32    	 2483638	       473 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_32-32    	 2429887	       473 ns/op	     273 B/op	       4 allocs/op
Benchmark_DirectReject_SlotCheck_32-32    	 2488936	       474 ns/op	     273 B/op	       4 allocs/op
Benchmark_WarmUpReject_SlotCheck_4-32     	 2642502	       459 ns/op	     273 B/op	       4 allocs/op
Benchmark_WarmUpReject_SlotCheck_4-32     	 2653810	       448 ns/op	     273 B/op	       4 allocs/op
Benchmark_WarmUpReject_SlotCheck_4-32     	 2644225	       444 ns/op	     273 B/op	       4 allocs/op
Benchmark_WarmUpReject_SlotCheck_8-32     	 2148102	       574 ns/op	     434 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_8-32     	 2116141	       562 ns/op	     434 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_8-32     	 2086344	       553 ns/op	     433 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_16-32    	 1961230	       597 ns/op	     434 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_16-32    	 2004345	       577 ns/op	     433 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_16-32    	 2030932	       582 ns/op	     433 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_32-32    	 1911838	       596 ns/op	     433 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_32-32    	 1889791	       608 ns/op	     433 B/op	       5 allocs/op
Benchmark_WarmUpReject_SlotCheck_32-32    	 1924222	       597 ns/op	     433 B/op	       5 allocs/op
```
对于Reject策略的流控，QPS大概是：220W
对于warmUp策略流控，QPS大概是：190W
# circuitbreaker module benchmark
测试Sentinel Go 的circuitbreaker module的性能(这里是包含了核心统计相关slot)。

测试用例：[https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/circuitbreaker/circuitbreaker_benchmark_test.go](https://github.com/louyuting/sentinel-golang/blob/20201121-benchmark-test/tests/benchmark/circuitbreaker/circuitbreaker_benchmark_test.go)

测试命令： 
```
cd sentinel-golang/tests/benchmark/circuitbreaker
go test -bench=.  -count=3 ./circuitbreaker_benchmark_test.go
```

测试结果：
```
Benchmark_SlowRequestRatio_SlotCheck_4-32     	 3038710	       373 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_4-32     	 3302108	       371 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_4-32     	 3255811	       376 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_8-32     	 3145548	       380 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_8-32     	 3099286	       382 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_8-32     	 3086161	       386 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_16-32    	 3125439	       396 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_16-32    	 2978125	       387 ns/op	     161 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_16-32    	 3037093	       394 ns/op	     161 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_32-32    	 2981632	       399 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_32-32    	 3007478	       394 ns/op	     160 B/op	       7 allocs/op
Benchmark_SlowRequestRatio_SlotCheck_32-32    	 2932548	       386 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_4-32           	 3059072	       382 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_4-32           	 3064104	       386 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_4-32           	 3098480	       388 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_8-32           	 3121515	       391 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_8-32           	 3066859	       387 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_8-32           	 3065515	       385 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_16-32          	 3106287	       389 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_16-32          	 2983831	       392 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_16-32          	 3075418	       386 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_32-32          	 2960368	       399 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_32-32          	 2840356	       407 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorRatio_SlotCheck_32-32          	 3010664	       393 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_4-32           	 3022701	       391 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_4-32           	 3076753	       391 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_4-32           	 3083796	       391 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_8-32           	 3083421	       397 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_8-32           	 2988315	       390 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_8-32           	 2997117	       391 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_16-32          	 3029377	       398 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_16-32          	 2971540	       394 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_16-32          	 3014689	       393 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_32-32          	 2925026	       404 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_32-32          	 2838646	       400 ns/op	     160 B/op	       7 allocs/op
Benchmark_ErrorCount_SlotCheck_32-32          	 2887366	       399 ns/op	     160 B/op	       7 allocs/op
```
三种熔断策略性能差不多，QPS大概都是：260W 
# hotspot module benchmark
测试Sentinel Go 的hotspot module的性能(这里是包含了核心统计相关slot)。

测试用例：[https://github.com/louyuting/sentinel-golang/blob/master/tests/benchmark/hotspot/hotspot_benchmark_test.go](https://github.com/louyuting/sentinel-golang/blob/master/tests/benchmark/hotspot/hotspot_benchmark_test.go)

测试命令： 
```
cd sentinel-golang/tests/benchmark/hotspot
go test -bench=.  -count=3 ./hotspot_benchmark_test.go
```

测试结果：
```
Benchmark_Concurrency_Concurrency4-32        	 3388903	       344 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency4-32        	 3452466	       348 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency4-32        	 3445453	       345 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency8-32        	 3303561	       357 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency8-32        	 3423398	       355 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency8-32        	 3313789	       362 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency16-32       	 3306313	       369 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency16-32       	 3248838	       367 ns/op	     112 B/op	       3 allocs/op
Benchmark_Concurrency_Concurrency16-32       	 3234538	       364 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency4-32         	 3275845	       363 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency4-32         	 3369584	       358 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency4-32         	 3428155	       357 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency8-32         	 3983560	       295 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency8-32         	 4026822	       299 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency8-32         	 4146592	       298 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency16-32        	 3921178	       309 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency16-32        	 4010104	       298 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Reject_Concurrency16-32        	 3701906	       299 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency4-32     	 4121079	       277 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency4-32     	 4127185	       284 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency4-32     	 4268814	       294 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency8-32     	 4243270	       285 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency8-32     	 4018002	       280 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency8-32     	 4014860	       286 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency16-32    	 4318598	       302 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency16-32    	 3878094	       290 ns/op	     112 B/op	       3 allocs/op
Benchmark_QPS_Throttling_Concurrency16-32    	 4328227	       294 ns/op	     112 B/op	       3 allocs/op
```
整体QPS大概也是：280W

