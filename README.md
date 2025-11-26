# 消逝卡（平板端）
## 配置资源文件
~~~ 
- url: /hacsfiles/xiaoshi-pad-card/xiaoshi-pad-card.js
  type: module
~~~

## 功能1：分布卡(温度分布、湿度分布)
**引用示例**
~~~
type: custom:xiaoshi-pad-grid-card
display: true                # 当display为true或者[[[ return true]]] 时 隐藏整张卡片
entities:
  - entity: sensor.shidu_ciwo
    grid: 0%,0%,30%,29%
  - entity: sensor.shidu_keting
    grid: 32%,69%,17%,9%     # 横坐标、纵坐标、宽度、高度
    state: false             # false不显示数值，默认显示，可省略 
    unit: " %"               # 显示的单位，默认不显示，可省略
width: 100px                 # 卡片 整体宽度
height: 120px                # 卡片 整体高度
min: 20                      # 当前地区最小值
max: 80                      # 当前地区最大值
mode: 湿度                   # 【温度】或者【湿度】
~~~

## 功能2：HA版本更新卡(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-update-card
width: 100%
theme: on
~~~

## 功能3：HA离线设备卡(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-offline-card
width: 100%
theme: on
exclude_devices:
  - *设备*
exclude_entities:
  - *shiti*
~~~

## 功能4：电话信息余额卡(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-balance-card
name: 电话余额信息
width: 100%
theme: on
entities:
  - entity_id: sensor.999
    attribute: null
    overrides:
      icon: ""
      name: ""
      unit_of_measurement: ""
      warning: ""
  - entity_id: input_boolean.777
    attribute: friendly_name
    overrides:
      name: ""
      icon: ""
      unit_of_measurement: ""
      warning: "99"
~~~

## 功能5：待办事项卡(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-todo-card
width: 100%
theme: on
entities:
  - todo.kuai_di
  - todo.ji_shi_ben
~~~

## 功能6：耗材信息卡片(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-consumables-card
width: 100%
global_warning: <8
columns: "2"
entities:
  - entity_id: input_text.aaa
    overrides:
      name: 奥斯卡德拉萨达实打实实打实
      unit_of_measurement: "%"
      warning: <10
      conversion: "*2"
      icon: ""
  - entity_id: input_text.aaa1
  - entity_id: input_text.aaa2
  - entity_id: input_text.aaa3
  - entity_id: input_text.aaa4
  - entity_id: input_text.aaa5
  - entity_id: input_text.aaa6
  - entity_id: input_text.aaa7
~~~


