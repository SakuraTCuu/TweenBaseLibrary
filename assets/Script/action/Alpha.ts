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

    _receiveTween = null;

    onLoad() {
        this.time = 1;
        this._tweenType = TweenType.ALPHA;

        this.tEdit.string = this.time + "";
        this.aEdit.string = this.alpha + "";
    }

    onChangeEnd(event, data) {
        switch (data) {
            case "a":
                this.alpha = Number(event.string);
                break;
            case "t":
                this.time = Number(event.string);
                break;
        }
        // this.sendTweenData(0);
        let result = {
            time: this.time,
            alpha: this.alpha,
        }

        this.dispatchEvent('changeData', result);
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
            data: {
                time: this.time,
                alpha: this.alpha,
            }
        })
    }
}
