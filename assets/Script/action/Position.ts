import BaseNode from "../base/BaseNode";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Position extends BaseNode {

    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    xEdit: cc.EditBox = null;

    @property(cc.EditBox)
    yEdit: cc.EditBox = null;

    time: number = 1;
    x: number = 50;
    y: number = 0;

    _receiveTween = null;

    onLoad() {
        this._tweenType = TweenType.POSITION;
        this.color = '#00ff00'

        this.tEdit.string = this.time + "";
        this.xEdit.string = this.x + "";
        this.yEdit.string = this.y + "";
        this.initEvent();
    }

    onChangeEnd(event, data) {
        switch (data) {
            case "x":
                this.x = Number(event.string);
                break;
            case "y":
                this.y = Number(event.string);
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
                position: cc.v2(this.x, this.y)
            })
        } else {
            tween.by(this.time, {
                position: cc.v2(this.x, this.y)
            })
        }
        return tween;
    }
}
