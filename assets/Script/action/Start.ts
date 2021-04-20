import BaseOnceNode from "../base/BaseOnceNode";
import { TweenType } from "../base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Start extends BaseOnceNode {

    onLoad() {
        this._tweenType = TweenType.START;
        this.initEvent();
    }
 
}
