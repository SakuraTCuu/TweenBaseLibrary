import BaseTween from "../base/BaseTween";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Alpha extends BaseTween {

    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    aEdit: cc.EditBox = null;

    alpha: number = 0.2;

    onLoad() {
        this.time = 1;
        this._tweenType = TweenType.ALPHA;
        this._tweenFlag = TweenFlag.TO;

        this.tEdit.string = this.time + "";
        this.aEdit.string = this.alpha + "";
    }

    onChangeEnd(event, data) {
        cc.log(event)
        switch (data) {
            case "a":
                this.alpha = Number(event.string);
                break;
            case "t":
                this.time = Number(event.string);
                break;
        }
        this.sendTweenData();
    }

    /**怎么返回tween? */
    returnData() {
        let tween = cc.tween();
        if (this._tweenFlag === TweenFlag.TO) {
            tween.to(this.time, {
                opacity: 255 * this.alpha
            })
        } else {
            tween.to(this.time, {
                opacity: 255 * this.alpha
            })
        }
        this.exportData();
        return tween;
    }

    exportData() {
        Object.assign(this._exportData, {
            easingType: this._easingType,
            tweenFlag: this._tweenFlag,
            tweenType: this._tweenType,
            time: this.time,
            data: {
                // alpha: this.alpha,
                opacity: this.alpha * 255
            }
        })
    }
}
