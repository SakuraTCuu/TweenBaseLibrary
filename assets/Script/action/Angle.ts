import BaseNode from "../base/BaseNode";
import { TweenType, TweenFlag } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Angle extends BaseNode {


    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    aEdit: cc.EditBox = null;

    time: number = 1;
    angle: number = 360;

    _receiveTween = null;

    onLoad() {
        this._tweenType = TweenType.OPACITY;
        this.color = '#A3A613'

        this.tEdit.string = this.time + "";
        this.aEdit.string = this.angle + "";
        this.initEvent();
    }

    onChangeEnd(event, data) {
        switch (data) {
            case "a":
                this.angle = Number(event.string);
                break;
            case "t":
                this.time = Number(event.string);
                break;
        }

        this.sendTweenData(0);
    }

    /**怎么返回tween? */
    returnData() {
        let tween = cc.tween();
        if (this._tweenFlag === TweenFlag.TO) {
            tween.to(this.time, {
                angle: this.angle
            })
        } else {
            tween.by(this.time, {
                angle: this.angle
            })
        }
        return tween;
    }
}
