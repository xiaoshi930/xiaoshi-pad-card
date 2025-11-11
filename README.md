# 消逝卡（平板端）
## 配置资源文件
~~~ 
- url: /hacsfiles/xiaoshi-pad-card/xiaoshi-card.js
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

## 功能2：进度条
**引用示例**
~~~
type: custom:xiaoshi-pad-slider-card
entity: number.xxxxxxx
style:
  slider-width: 110px                 # 总宽度，默认100px
  slider-height: 10px                 # 总高度，默认30px
  track-color: rgba(200,200,200,0.5)  # 背景色，默认rgba(255,255,255,0.3)
  thumb-size: 15px                    # 进度点大小，默认15px
  thumb-color: rgb(255,255,255)       # 进度点颜色，默认，白色
  slider-color: rgb(25,155,125)       # 进度条背景色，默认，浅蓝色
  track-height: 20px                  # 进度条高度，默认5px
  track-radius: 4px                   # 圆角大小，默认2px
~~~
