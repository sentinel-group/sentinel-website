<img src="https://user-images.githubusercontent.com/9434884/43697219-3cb4ef3a-9975-11e8-9a9c-73f4f537442d.png" alt="Sentinel Logo" height="40%" width="40%">

# Sentinel: The Sentinel of Your Microservices

## What Is Sentinel?

As distributed systems are becoming increasingly popular, the reliability between services is becoming more important than ever before. Sentinel is a powerful fault-tolerance component that takes "flow" as the breakthrough point and covers multiple fields including flow control, traffic shaping, concurrency limiting, circuit breaking, and adaptive system protection to guarantee the reliability and resiliency of microservices.

## History of Sentinel

* 2012, Sentinel was born in Alibaba with the main purpose of flow control.
* 2013-2017, Sentinel grew fast and became a fundamental component for all microservices in Alibaba. It was used in more than 6000 services and covers almost all core e-commerce scenarios. 
* 2018, [Sentinel](https://github.com/alibaba/Sentinel) evolves into an open-source project.
* 2020, Sentinel Go released.

## Key Concepts

### Resources

**Resource** is a key concept in Sentinel. It could be anything, such as a service, a method, or even any code snippet.

Once it is wrapped by Sentinel API, it is defined as a resource. Sentinel will record its real-time metrics and perform rule checking.

### Rules

The way Sentinel protects resources is defined by rules, such as flow control, concurrency control, and circuit breaking rules. Rules can be dynamically updated, and take effect in real-time.

## Features and Principles

### Flow control and traffic shaping

Sentinel provides the ability to handle random incoming requests according to the appropriate shape as needed, as illustrated below:

![Flow Shaping Overview](https://user-images.githubusercontent.com/9434884/49591358-35ab2d00-f9a9-11e8-9305-7c42337d87ae.png)

### Principles of flow control

Flow control is based on the following statistics:

* Invocation chain between resources;
* Runtime metrics such as QPS, response time and system load;
* Desired actions to take, such as reject immediately or queueing.

Sentinel allows applications to combine all these statistics in a flexible manner. 

## Circuit breaking and concurrency control

Circuit breaking is used to detect failures and encapsulates the logic of preventing failure from constantly reoccurring during maintenance, temporary external system failure or unexpected system difficulties. 

Sentinel leverages the following principles to prevent your services from cascade failure:

- Concurrency control
- Circuit breaking by slow requests or error ratio

## Adaptive system protection

Sentinel can be used to protect your services in case the system load or CPU usage goes too high. It helps you to achieve a good balance between system load and incoming requests.

## How Sentinel works

![image](https://user-images.githubusercontent.com/9434884/69955207-1e5d3c00-1538-11ea-9ab2-297efff32809.png)