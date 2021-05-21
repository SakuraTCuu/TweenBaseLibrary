import BaseOnceNode from "../base/BaseOnceNode";
import { TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DelayContent extends BaseOnceNode {

    @property(cc.EditBox)
    dEdit: cc.EditBox = null;

    _delay = 0.5;
    onLoad() {
        this._tweenType = TweenType.DELAY;
        this.dEdit.string = this._delay + "";
        this.time = this._delay;
        this.initEvent();
    }

    onChangeEnd(event) {
        this._delay = Number(event.string);
        this.time = this._delay;
        this.sendTweenData();
    }

    returnData() {
        let tween = cc.tween();
        tween.delay(this._delay);
        this.exportData();
        return tween;
    }

    exportData() {
        Object.assign(this._exportData, {
            tweenType: this._tweenType,
            delay: this._delay
        })
    }

}
