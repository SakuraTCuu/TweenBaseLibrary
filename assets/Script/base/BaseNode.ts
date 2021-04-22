import { TweenType, TypeColor } from "./Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseNode extends cc.Component {

    @property(cc.Label)
    UuidLabel: cc.Label = null;

    protected _tweenType: TweenType = TweenType.NORMAL;/**type类型，用于标识是何种类型 */
    public get tweenType() {
        return this._tweenType;
    }
    public set tweenType(value) {
        this._tweenType = value;
    }

    protected _uuid: string = Date.now() + "";//随机生成uuid 作为唯一标识 TODO Temp

    onLoad() {

    }

    start() {
        if (this.UuidLabel) {
            this.UuidLabel.string = this._uuid + "   " + this.getNodeType();
        }
        this.node.color = this.getNodeColor();
    }

    getUuid() {
        return this._uuid;
    }

    getNodeColor(): cc.Color {
        switch (this._tweenType) {
            case TweenType.POSITION: return cc.color(TypeColor.position);
            case TweenType.SCALE: return cc.color(TypeColor.scale);
            case TweenType.ALPHA: return cc.color(TypeColor.alpha);
            case TweenType.ANGLE: return cc.color(TypeColor.angle);
            case TweenType.COLOR: return cc.color(TypeColor.color);
            case TweenType.START: return cc.color(TypeColor.start);
            case TweenType.PARALLEL: return cc.color(TypeColor.start);
                return cc.Color.BLUE;
        }
    }

    getNodeType(): string {
        switch (this._tweenType) {
            case TweenType.POSITION: return 'Position';
            case TweenType.SCALE: return 'Sale';
            case TweenType.ALPHA: return 'Alpha';
            case TweenType.ANGLE: return 'Angle';
            case TweenType.COLOR: return 'Color';
            case TweenType.START: return 'Start';
            case TweenType.PARALLEL: return 'Parallel';
                return '';
        }
    }

    /**send event */
    dispatchEvent(name, data) {
        let event = new cc.Event.EventCustom(name, true);
        event.detail = data;
        this.node.dispatchEvent(event);
    }
}
