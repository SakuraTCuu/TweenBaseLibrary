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

    @property(cc.Label)
    UuidLabel: cc.Label = null;

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

    protected _tweenFlag: TweenFlag = TweenFlag.BY; /** tween 标志 */
    public get tweenFlag(): TweenFlag {
        return this._tweenFlag;
    }
    public set tweenFlag(value: TweenFlag) {
        this._tweenFlag = value;
    }

    protected _preTween: cc.Tween = null; //上级传过来的tween
    protected _isBind: boolean = true;
    protected _uuid: string = Date.now() + "";//随机生成uuid 作为唯一标识 TODO Temp
    protected _toUuid: string = "";  //右边节点  to
    protected _fromUuid: string = ""; //左边节点 接收
    protected color = '#ff0000';

    onLoad() {
    }

    getUuid() {
        return this._uuid;
    }

    bindFromUuid(uuid) {
        this._fromUuid = uuid;
        if (this._fromUuid && this._fromUuid !== uuid) { /**换绑 */
            this._preTween = null;
            this.sendTweenData(0);
        }
        this.registerEvent();
    }

    unBindFromUuid() {
        this._fromUuid = "";
        this._preTween = null;
        /**解绑后重新发送tweendata */
        this.sendTweenData(0);
        this.unRegisterEvent();
    }

    bindToUuid(uuid) {
        this._toUuid = uuid;
        this.sendTweenData(0);
    }

    unBindToUuid() {
        this._toUuid = "";
    }

    /**每一个继承自此基类的组件都向main派发事件
     * 当节点移动时,触发时间
     */
    initEvent() {
        this.UuidLabel.string = this._uuid;
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)

        if (this.LineTo) {
            this.LineTo.on(cc.Node.EventType.TOUCH_START, this.touchLineStart, this)
            this.LineTo.on(cc.Node.EventType.TOUCH_MOVE, this.touchLineMove, this);
            this.LineTo.on(cc.Node.EventType.TOUCH_END, this.touchLineEnd, this);
            this.LineTo.on(cc.Node.EventType.TOUCH_CANCEL, this.touchLineEnd, this);
        }
        this.sendPosition();
    }

    touchLineFromStart(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }
    }

    touchLineFromMove(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }
        let pos = e.getLocation();
        let event = new cc.Event.EventCustom("LineMove", true);
        event.detail = {
            uuid: this._fromUuid,
            pos: pos
        }
        this.node.dispatchEvent(event)
    }

    touchLineFromEnd(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }

        let pos = e.getLocation();

        /**判断是否有接触目标区域 */
        let event = new cc.Event.EventCustom("LineUnbind", true);

        event.detail = {
            uuid: this._uuid,
            from_uuid: this._fromUuid,
            pos,
        }
        this.node.dispatchEvent(event)
    }

    registerEvent() {
        if (this.LineFrom) {
            this.LineFrom.on(cc.Node.EventType.TOUCH_START, this.touchLineFromStart, this)
            this.LineFrom.on(cc.Node.EventType.TOUCH_MOVE, this.touchLineFromMove, this);
            this.LineFrom.on(cc.Node.EventType.TOUCH_END, this.touchLineFromEnd, this);
            this.LineFrom.on(cc.Node.EventType.TOUCH_CANCEL, this.touchLineFromEnd, this);
        }
    }

    unRegisterEvent() {
        if (this.LineFrom) {
            this.LineFrom.off(cc.Node.EventType.TOUCH_START, this.touchLineFromStart, this)
            this.LineFrom.off(cc.Node.EventType.TOUCH_MOVE, this.touchLineFromMove, this);
            this.LineFrom.off(cc.Node.EventType.TOUCH_END, this.touchLineFromEnd, this);
            this.LineFrom.off(cc.Node.EventType.TOUCH_CANCEL, this.touchLineFromEnd, this);
        }
    }

    touchMove(event: cc.Event.EventTouch) {
        // event.stopPropagation(); //事件透传
        event['isBaseTouchMove'] = true;
        let x = event.getDeltaX();
        let y = event.getDeltaY();
        this.node.x += x;
        this.node.y += y;
        this.sendPosition();
    }

    touchEnd() {
        event.stopPropagation();
        this.sendPosition();
    }

    sendPosition() {
        let toPos, fromPos;
        if (this.LineTo) {
            toPos = this.node.convertToWorldSpaceAR(this.LineTo.position);
        }
        if (this.LineFrom) {
            fromPos = this.node.convertToWorldSpaceAR(this.LineFrom.position);
        }

        /*派发*/
        let event = new cc.Event.EventCustom("toFromInfo", true);
        event.detail = {
            uuid: this._uuid,
            toPos,
            fromPos
        }
        this.node.dispatchEvent(event)
    }

    /**=================================曲线线条事件============================================== */
    /**由子节点触发事件 */
    touchLineStart(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (this._toUuid) {
            return;
        }
        let pos = this.node.convertToWorldSpaceAR(this.LineTo.position);
        /*创建线条*/
        let event = new cc.Event.EventCustom("LineCreate", true);
        event.detail = {
            uuid: this._uuid,
            pos,
            color: this.color
        }
        this.node.dispatchEvent(event)
    }

    /**由子节点触发事件 */
    touchLineMove(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (this._toUuid) {
            return;
        }
        let pos = e.getLocation();
        // pos = this.node.convertToNodeSpaceAR(pos);
        // pos.x /= cc.Camera.main.zoomRatio;
        // pos.y /= cc.Camera.main.zoomRatio;
        // pos = this.node.convertToWorldSpaceAR(pos);
        /*创建线条*/
        let event = new cc.Event.EventCustom("LineMove", true);
        event.detail = {
            uuid: this._uuid,
            pos: pos
        }
        this.node.dispatchEvent(event)
    }

    /**由子节点触发事件 */
    touchLineEnd(e) {
        e.stopPropagation();
        let pos = e.getLocation();
        if (this._toUuid) {
            return;
        }

        /**判断是否有接触目标区域 */
        let event = new cc.Event.EventCustom("LineEnd", true);

        event.detail = {
            uuid: this._uuid,
            pos: pos,
        }
        this.node.dispatchEvent(event)
    }

    receiveData(tweenData) {
        this._preTween = tweenData;
        this.solveData();
    }

    sendTweenData(isCustom, targetName?, tweenData?) {
        targetName = targetName || "tweenData";
        tweenData = tweenData || this.returnData(0);

        if (!isCustom) {
            if (!this._toUuid) {
                return;
            }
        }

        let tweenEvent = new cc.Event.EventCustom(targetName, true);
        tweenEvent.detail = {
            tarUuid: this._toUuid,
            tweenData
        };
        this.node.dispatchEvent(tweenEvent)
    }

    /**子类实现 */
    solveData() { }
    returnData(type) { }

}
