import { EasingType, TweenFlag, TweenType } from "./Config";

const { ccclass, property } = cc._decorator;

/**
 * 基础Node
 * 扩展其他属性
 */
@ccclass
export default class BaseNode extends cc.Component {

    @property(cc.Node)
    LineFrom: cc.Node = null;

    @property(cc.Node)
    LineTo: cc.Node = null;

    protected _tweenType: TweenType = TweenType.NORMAL;/**type类型，用于标识是何种类型 */
    public get type() {
        return this._tweenType;
    }
    public set type(value) {
        this._tweenType = value;
    }

    protected _easingType: EasingType = EasingType.NULL;/**缓动类型 */
    public get easingType() {
        return this._easingType;
    }
    public set easingType(value) {
        this._easingType = value;
    }

    protected _tweenFlag: TweenFlag = TweenFlag.TO; /** tween 标志 */
    public get tweenFlag(): TweenFlag {
        return this._tweenFlag;
    }
    public set tweenFlag(value: TweenFlag) {
        this._tweenFlag = value;
    }

    protected _isBind: boolean = true;
    protected _uuid: string = Date.now() + "";//随机生成uuid 作为唯一标识 TODO Temp

    onLoad() {
    }

    /**每一个继承自此基类的组件都向main派发事件
     * 当节点移动时,触发时间
     */
    initEvent() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)

        this.sendPosition();
    }

    touchMove(event: cc.Event.EventTouch) {
        let x = event.getDeltaX();
        let y = event.getDeltaY();
        this.node.x += x;
        this.node.y += y;
        this.sendPosition();
    }

    touchEnd() {
        this.sendPosition();
    }

    sendPosition() {
        let toPos = this.node.convertToWorldSpaceAR(this.LineTo.position);
        let fromPos = this.node.convertToWorldSpaceAR(this.LineFrom.position);

        /*派发*/
        let event = new cc.Event.EventCustom("toFromInfo", true);
        event.detail = {
            uuid: this._uuid,
            toPos,
            fromPos
        }
        this.node.dispatchEvent(event)
    }


    /**由子节点触发事件 */
    touchLineStart(e: cc.Event.EventTouch) {
        e.stopPropagation();
        let pos = this.node.convertToWorldSpaceAR(this.LineTo.position);
        /*创建线条*/
        let event = new cc.Event.EventCustom("LineCreate", true);
        event.detail = {
            uuid: this._uuid,
            pos
        }
        this.node.dispatchEvent(event)
    }

    /**由子节点触发事件 */
    touchLineMove(e) {
        e.stopPropagation();
        /*创建线条*/
        let event = new cc.Event.EventCustom("LineMove", true);
        event.detail = {
            uuid: this._uuid,
            pos: e.getLocation()
        }
        this.node.dispatchEvent(event)
    }

    /**由子节点触发事件 */
    touchLineEnd(e) {
        e.stopPropagation();
        /**判断是否有接触目标区域 */
        let event = new cc.Event.EventCustom("LineEnd", true);
        event.detail = {
            uuid: this._uuid,
            pos: e.getLocation(),
            hook_cb: (flag) => {//回调函数  用来处理链接后,绑定两BaseNode
                if (flag) {
                    //绑定成功
                    this._isBind = true;
                }
            }
        }
        this.node.dispatchEvent(event)
    }

}
