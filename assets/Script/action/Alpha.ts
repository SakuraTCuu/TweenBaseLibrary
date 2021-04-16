import BaseNode from "../base/BaseNode";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Alpha extends BaseNode {

    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    aEdit: cc.EditBox = null;

    alpha: number = 0.2;

    _receiveTween = null;

    onLoad() {
        this.time = 1;
        this._tweenType = TweenType.ALPHA;
        this.color = '#D0452E'

        this.tEdit.string = this.time + "";
        this.aEdit.string = this.alpha + "";
        this.initEvent();
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
        this.sendTweenData(0);
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
            tweenData: {
                time: this.time,
                alpha: this.alpha,
            }
        })
    }
}
