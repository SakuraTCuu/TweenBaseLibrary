# hello-world


基本思想: 可视化编辑tween 属性

action目录: 基础twenn类型

base目录:  
     BaseNode : 基类,负责:  uuid,事件分发,颜色展示, tweenType
     BaseOnceNode: 节点中间类,  一个动作容器节点, 负责: 接收数据,组装数据,更新状态,绑定状态
     BaseContentNode: 节点具体实现类, 可以增加,减少基础动作,接收基础动作组件的事件,封装,传递,解析
     BaseTween: 基础动效类, 负责:  相对/绝对动作, 缓动类型,组装tween数据,发送数据
     Line: 连线线条组件 贝塞尔曲线,进度球展示

HelloWorld: 界面相关管理类, 动作执行,事件接收,
LineManager: 线条引脚管理
PointManager: 引脚端点管理
TweenParseManager:  数据解析类, 传入数据,返回tween,  将来的解析类,

TODO: 
 增加事件回调,进度                
 增加tween动画与音效的配合    扩展BaseTween类,增加音效类型
 增加tween动画与龙骨动画配合   扩展BaseTween类,选择龙骨动画类型
 增加动画库展示,动画列表       

优化: 
 优化界面展示, 调整颜色等
 界面缩放,调整曲线
 嵌套tween

bug: 
 camera zoom 变小, 引脚连线位置不准确

