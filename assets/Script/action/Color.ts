import BaseTween from "../base/BaseTween";
import { TweenType, TweenFlag } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Color extends BaseTween {

    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    cEdit: cc.EditBox = null;

    c: any = '#ff0000';

    _receiveTween = null;

    onLoad() {
        this.time = 1;
        this._tweenType = TweenType.COLOR;

        this.tEdit.string = this.time + "";
        this.cEdit.string = this.c;
    }

    onChangeEnd(event, data) {
        switch (data) {
            case "c":
                this.c = event.string;
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
                color: cc.color(this.c)
            })
        } else {
            tween.to(this.time, {
                color: cc.color(this.c)
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
                color: this.c,
            }
        })
    }
}
