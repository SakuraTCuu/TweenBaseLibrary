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
    protected _tarUuid: string = "";

    onLoad() {
    }

    getUuid() {
        return this._uuid;
    }

    /**每一个继承自此基类的组件都向main派发事件
     * 当节点移动时,触发时间
     */
    initEvent() {
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
        if (!this._tarUuid) {
            return;
        }
    }

    touchLineFromMove(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._tarUuid) {
            return;
        }
        let pos = e.getLocation();
        // pos = this.node.convertToNodeSpaceAR(pos);
        // pos = this.node.convertToWorldSpaceAR(pos);
        /**/
        let event = new cc.Event.EventCustom("LineMove", true);
        event.detail = {
            uuid: this._uuid,
            pos: pos
        }
        this.node.dispatchEvent(event)
    }

    touchLineFromEnd(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._tarUuid) {
            return;
        }
        let pos = e.getLocation();

        /**判断是否有接触目标区域 */
        let event = new cc.Event.EventCustom("LineUnbind", true);

        event.detail = {
            uuid: this._uuid,
            pos: pos,
            hook_cb: (flag) => {
                if (flag) {
                    //解绑
                    this._isBind = false;
                    this._tarUuid = "";
                }
            }
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

    /**由子节点触发事件 */
    touchLineStart(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (this._tarUuid) {
            return;
        }
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
    touchLineMove(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (this._tarUuid) {
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
        if (this._tarUuid) {
            return;
        }
        // pos.x /= cc.Camera.main.zoomRatio;
        // pos.y /= cc.Camera.main.zoomRatio;

        /**判断是否有接触目标区域 */
        let event = new cc.Event.EventCustom("LineEnd", true);

        event.detail = {
            uuid: this._uuid,
            pos: pos,
            hook_cb: (flag, tarUuid) => {//回调函数  用来处理链接后,绑定两BaseNode
                if (flag) {
                    //绑定成功
                    this._isBind = true;
                    // 给tarUuid传递tween
                    this._tarUuid = tarUuid;
                    this.sendTweenData(0);
                }
            }
        }
        this.node.dispatchEvent(event)
    }

    bindUuid(uuid) {
        this._tarUuid = uuid;
        this.registerEvent();
    }

    receiveData(tweenData) {
        this.solveData(tweenData);
    }

    sendTweenData(isCustom, targetName?, tweenData?) {
        targetName = targetName || "tweenData";
        tweenData = tweenData || this.returnData();

        if (!isCustom) {
            if (!this._tarUuid) {
                return;
            }
            // if (!isCustom || !this._tarUuid) {
            //     return;
            // }
        }

        let tweenEvent = new cc.Event.EventCustom(targetName, true);
        tweenEvent.detail = {
            tarUuid: this._tarUuid,
            tweenData
        };
        this.node.dispatchEvent(tweenEvent)
    }

    /**子类实现 */
    solveData(tweenData) {

    }
    returnData() {

    }

}
