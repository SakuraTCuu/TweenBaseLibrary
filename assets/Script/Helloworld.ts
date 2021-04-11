const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    MainNode: cc.Node = null;

    onLoad() {

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
