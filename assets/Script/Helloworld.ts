const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    MainNode: cc.Node = null;

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    PositionPre: cc.Prefab = null;

    globalTween = {};

    onLoad() {
        this.initView();
        this.initEvent();
    }

    initView() {
        let item = cc.instantiate(this.PositionPre);
        item.parent = this.ContentNode;
    }

    initEvent() {
        this.ContentNode.on("position", (event: cc.Event.EventCustom) => {
            cc.log(event);
            let tween = event.getUserData().tween;
            // this.globalTween['position'] = tween;
            this.tweenFactory(tween);
        }, this)
    }

    tweenFactory(tween) {
        tween.target(this.MainNode).start();
    }

    startTween() {
        let t1 = this.opacityTween();
        let t2 = this.scaleTween();

        let tween = cc.tween()
            .target(this.MainNode)
            .parallel(
                t1,
                t2
            )
        return tween.start();
    }

    opacityTween() {
        return cc.tween().to(0.5, {
            opacity: 0
        })
    }

    scaleTween() {
        return cc.tween().to(0.5, {
            scale: 2
        })
    }
}
