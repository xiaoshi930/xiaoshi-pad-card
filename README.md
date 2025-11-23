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
width: 100p%  
theme: on
~~~

## 功能3：HA离线设备卡(手机平板端通用)
**引用示例**
~~~
type: custom:xiaoshi-offline-card
width: 320px
exclude_devices:
  - *设备*
exclude_entities:
  - *shiti*
~~~
