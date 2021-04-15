import BaseNode from "../base/BaseNode";
import { TweenType, TweenFlag } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Color extends BaseNode {


    @property(cc.EditBox)
    tEdit: cc.EditBox = null;

    @property(cc.EditBox)
    cEdit: cc.EditBox = null;

    time: number = 1;
    c: any = '#ff0000';

    _receiveTween = null;

    onLoad() {
        this._tweenType = TweenType.OPACITY;
        this.color = '#00C2F9'

        this.tEdit.string = this.time + "";
        this.cEdit.string = this.c;
        this.initEvent();
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

        this.sendTweenData(0);
    }

    /**怎么返回tween? */
    returnData(type) {
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
