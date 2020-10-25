# DataSource Extension
The overall workflow is the same as the Java version. Please see the architecture below:
![](https://user-images.githubusercontent.com/9434884/45406233-645e8380-b698-11e8-8199-0c917403238f.png)

This article focuses on the design of updating the property on the application side.

# Abstract Model:

## Property
```go
// PropertyConverter func is to converter source message bytes to the specific property.
// the first  return value: is the real property;
// the second return value: return nil if succeed to convert src, if not return the detailed error when convert src.
// if src is nil or len(src)==0, the return value is (nil,nil)
type PropertyConverter func(src []byte) (interface{}, error)

// PropertyUpdater func is to update the specific properties to downstream.
// return nil if succeed to update, if not, return the error.
type PropertyUpdater func(data interface{}) error

// abstract interface to describe the property handler
type PropertyHandler interface {
	// check whether the current src is consistent with last update property
	isPropertyConsistent(src interface{}) bool
	// handle the current property
	Handle(src []byte) error
}

// DefaultPropertyHandler encapsulate the Converter and updater of property.
// One DefaultPropertyHandler instance is to handle one property type.
// DefaultPropertyHandler should check whether current property is consistent with last update property
// converter convert the message to the specific property
// updater update the specific property to downstream.
type DefaultPropertyHandler struct {
	lastUpdateProperty interface{}

	converter PropertyConverter
	updater   PropertyUpdater
}

func (h *DefaultPropertyHandler) isPropertyConsistent(src interface{}) bool {
	isConsistent := reflect.DeepEqual(src, h.lastUpdateProperty)
	if isConsistent {
		return true
	} else {
		h.lastUpdateProperty = src
		return false
	}
}

func (h *DefaultPropertyHandler) Handle(src []byte) error {
	defer func() {
		if err := recover(); err != nil && logger != nil {
			logger.Panicf("Unexpected panic: %+v", errors.Errorf("%+v", err))
		}
	}()
	// converter to target property
	realProperty, err := h.converter(src)
	if err!=nil {
		return err
	}
	isConsistent := h.isPropertyConsistent(realProperty)
	if isConsistent {
		return nil
	}
	return h.updater(realProperty)
}

func NewDefaultPropertyHandler(converter PropertyConverter, updater PropertyUpdater) *DefaultPropertyHandler {
	return &DefaultPropertyHandler{
		converter: converter,
		updater:   updater,
	}
}
```

PropertyHandler is an abstract interface to describe the processing logic for the dynamic property, and DefaultPropertyHandler is the default implementation.

The process of a dynamic property is divided into two parts:

1. Converter: Read source bytes of property and convert to target type property;
2. Updater: Update the newer property to the downstream.

That is to say, each PropertyHandler must have a Converter function and a Updater function.

In order to avoid the useless update operation, DefaultPropertyHandler instance will cache the last updated property and check the consistency between current property value and last property value.

## Datasource
Datasource is the generic interface to describe the datasource instance. Each DataSource instance listen in one property.

```go
// The generic interface to describe the datasource
// Each DataSource instance listen in one property type.
type DataSource interface {
	// Add specified property handler in current datasource
	AddPropertyHandler(h PropertyHandler)
	// Remove specified property handler in current datasource
	RemovePropertyHandler(h PropertyHandler)
	// Read original data from the data source.
	// return source bytes if succeed to read, if not, return error when reading
	ReadSource() ([]byte, error)
	// Initialize the datasource and load initial rules
	// start listener to listen on dynamic source
	// panic if initialize failed;
	// once initialized, listener should recover all panic and error.
	Initialize()
	// Close the data source.
	io.Closer
}
```

Each DataSource instance listen on one property. There might be one or multi PropertyHandler in one Datasource to handle the same property.

the workflow of updating is as below:
![](https://img-blog.csdnimg.cn/20200302001548471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTA4NTMyNjE=,size_16,color_FFFFFF,t_70)

1. Read dynamic datasource message;
2. iterate DataSourceHandler List to handle dynamic datasource message;
3. Call Convert function of DataSourceHandler to convert raw message to specific property;
4. Call Update function of DataSourceHandler to update specific property to downstream component.

# Use case

## freshable file datasource
Refer to PR: [https://github.com/alibaba/sentinel-golang/pull/86/files](https://github.com/alibaba/sentinel-golang/pull/86/files)


