import BaseNode from "../base/BaseNode";
import { TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Start extends BaseNode {

    onLoad() {
        this._tweenType = TweenType.START;

        this.initEvent();
    }

    solveData(tweenData) {
        this.sendTweenData(1, 'tweenStart', tweenData)
    }
}
