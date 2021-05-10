import BaseTween from "../base/BaseTween";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Repeat extends BaseTween {

    @property(cc.EditBox)
    rEdit: cc.EditBox = null;

    repeat: number = 1;

    onLoad() {
        this._tweenType = TweenType.REPEAT;
        this.rEdit.string = this.repeat + "";
    }

    onChangeEnd(event, data) {
        switch (data) {
            case "repeat":
                this.repeat = event.string;
                break;
        }

        this.sendTweenData();
    }

    /**怎么返回tween? */
    returnData() {
        // let tween = cc.tween();
        // tween.call(() => { }).repeat(this.repeat);
        this.exportData();
        // return tween;
    }
    exportData() {
        Object.assign(this._exportData, {
            tweenType: this._tweenType,
            data: {
                repeat: this.repeat
            }
        })
    }
}
