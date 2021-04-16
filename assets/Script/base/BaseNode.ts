import { EasingType, TweenFlag, TweenType, TypeColor } from "./Config";

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

    @property(cc.Sprite)
    Effect: cc.Sprite = null;

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
    protected time: number = 0;
    private _color: any = '#ff0000';
    protected get color() {
        return this._color;
    }
    protected set color(value) {
        // this.node.color = cc.color(value);
        // this.LineTo.color = cc.color(value);
        // this.LineFrom.color = cc.color(value);
        this._color = value;
    }

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
        this.UuidLabel.string = this._uuid + "   " + this.getNodeType();

        this.node.color = this.getNodeColor();
        this.LineTo && (this.LineTo.color = this.node.color);
        this.LineFrom && (this.LineFrom.color = this.node.color);
        this.Effect && (this.Effect.node.color = cc.Color.WHITE);

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

    getNodeColor(): cc.Color {
        switch (this._tweenType) {
            case TweenType.POSITION: return cc.color(TypeColor.position);
            case TweenType.SCALE: return cc.color(TypeColor.scale);
            case TweenType.ALPHA: return cc.color(TypeColor.alpha);
            case TweenType.ANGLE: return cc.color(TypeColor.angle);
            case TweenType.COLOR: return cc.color(TypeColor.color);
            case TweenType.START: return cc.color(TypeColor.start);
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
                return '';
        }
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
            color: this.node.color
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

    /**处理循环引用 */
    receiveData(tweenData) {
        this._preTween = tweenData.clone();
        let flag = 0,
            targetName;
        if (this._tweenType === TweenType.START) {
            flag = 1;
            targetName = 'tweenStart'
        }
        this.sendTweenData(flag, targetName);
    }

    sendTweenData(isCustom, targetName?) {
        targetName = targetName || "tweenData";

        let tweenData = this.getStandardTween(this.returnData());

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

    export: boolean = false;

    /**封装好的数据 */
    getStandardTween(oriTween: cc.Tween) {
        let tween = this.getStartTween().clone();
        let endTween = this.getEndTween().clone();

        if (!this.export && this._tweenType !== TweenType.START) {
            if (this._preTween) { //把上级tween封装进来
                let temp = this._preTween.clone();
                return temp.then(tween).then(oriTween).then(endTween);
            }
            return tween.then(oriTween).then(endTween);
        } else {
            if (this._preTween) { //把上级tween封装进来
                let temp = this._preTween.clone();
                return temp.then(tween).then(endTween);
            }
            return tween.then(endTween);
        }
    }

    getStartTween() { /**开始动画前插入一个回调 */
        if (!this.export) {
            return cc.tween().call(() => {
                this.startEffect();
            }).clone();
        }
    }

    getEndTween() {
        if (!this.export) {/**动画结束后插入一个回调 */
            return cc.tween().call(() => {
                this.endEffect();
            })
        }
    }

    /**子类实现 */
    startEffect() {
        if (!this.Effect) {
            return;
        }
        // this.node.color = cc.Color.RED;
        this.Effect.node.active = true;
        this.Effect.node.opacity = 200;
        this.Effect.fillRange = 0;
        this.Effect.node.stopAllActions();
        cc.tween(this.Effect).to(this.time, {
            fillRange: 1
        }).call(() => {
            this.Effect.node.active = false;
        }).start();
    }
    endEffect() {
        // this.node.color = cc.Color.BLACK;
    }
    returnData(): cc.Tween { return cc.tween() }
}


