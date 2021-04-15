import BaseNode from "../base/BaseNode";
import { TweenFlag, TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Alpha extends BaseNode {

    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    aEdit: cc.EditBox = null;

    time: number = 1;
    alpha: number = 0.2;

    _receiveTween = null;

    onLoad() {
        this._tweenType = TweenType.OPACITY;
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
    returnData(type) {
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

        tween['_uuid'] = this._uuid;

        if (this._preTween) { //把上级tween封装进来
            let temp = this._preTween.clone();
            temp['_uuid'] = this._uuid;
            return temp.then(tween);
        }
        return tween;
    }

    solveData() {
        let curTween = this.returnData(1);
        this.sendTweenData(0, 'tweenData', curTween);
    }
}