import BaseOnceNode from "../base/BaseOnceNode";
import { TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CallContent extends BaseOnceNode {

    @property(cc.EditBox)
    cEdit: cc.EditBox = null;

    _call = 'test';
    onLoad() {
        this._tweenType = TweenType.CALL;
        this.cEdit.string = this._call;
        this.initEvent();
    }

    onChangeEnd(event) {
        this._call = event.string;
        this.sendTweenData();
    }

    returnData() {
        let tween = cc.tween();
        tween.call(() => {
            cc.log("call by ", this._call, this._uuid);
        })
        this.exportData();
        return tween;
    }

    exportData() {
        Object.assign(this._exportData, {
            tweenType: this._tweenType,
            hook_cb: this._call
        })
    }

}
