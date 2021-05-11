import { EasingType, TweenType } from "./base/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EasingList extends cc.Component {

    cb: Function = null;
    showView(cb) {
        this.cb = cb;
    }

    onClickBtn(event, type) {
        this.node.active = false;
        switch (type) {
            case 'quadIn':
                return this.cb && this.cb(EasingType.QUADIN);
            case 'quadOut':
                return this.cb && this.cb(EasingType.QUADOUT);
            case 'quadInOut':
                return this.cb && this.cb(EasingType.QUADINOUT);
            case 'backIn':
                return this.cb && this.cb(EasingType.BACKIN);
            case 'backOut':
                return this.cb && this.cb(EasingType.BACKOUT);
            case 'backInOut':
                return this.cb && this.cb(EasingType.BACKINOUT);
        }
        return this.cb && this.cb(EasingType.NULL);
    }
}
