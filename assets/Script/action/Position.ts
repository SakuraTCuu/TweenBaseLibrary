import BaseNode from "../base/BaseNode";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Position extends BaseNode {

    @property(cc.EditBox)
    xEdit: cc.EditBox = null;

    @property(cc.EditBox)
    yEdit: cc.EditBox = null;

    time: number = 0.5;
    x: number = 200;
    y: number = 200;

    onLoad() {
        this._tweenType = TweenType.POSITION;

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

        if (this.x && this.y && this.time) {
            this.sendTweenData(0);
        }
    }

    /**怎么返回tween? */
    returnData() {
        let tween = cc.tween();
        cc.log(this.x, this.y, this.time);
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

    solveData(tweenData) {
        cc.log("tweenData-->", tweenData)
    }
}
