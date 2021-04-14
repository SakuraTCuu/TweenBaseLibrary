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
    returnData(type) {
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

        tween['_uuid'] = this._uuid;

        if (this._receiveTween) {
            return this._receiveTween.then(tween);
        }
        return tween;
    }

    solveData(tweenData: cc.Tween) {
        this._receiveTween = tweenData.clone();
        let curTween = this.returnData(1);
        this.sendTweenData(0, 'tweenData', curTween);
    }

    unBindTween() {
        this._receiveTween = null;
    }
}
