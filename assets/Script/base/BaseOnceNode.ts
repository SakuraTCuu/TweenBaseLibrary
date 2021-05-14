import BaseNode from "./BaseNode";
import { EasingType, TweenFlag, TweenType, TypeColor } from "./Config";

const { ccclass, property } = cc._decorator;

/**
 * 基础Node
 * 扩展其他属性
 */
@ccclass
export default class BaseOnceNode extends BaseNode {

    @property(cc.Node)
    LineFrom: cc.Node = null;

    @property(cc.Node)
    LineTo: cc.Node = null;

    @property(cc.Sprite)
    Effect: cc.Sprite = null;

    protected _exportData = {};
    protected _preTween: cc.Tween = null; //上级传过来的tween
    protected _toUuid: string = "";  //右边节点  to
    protected _fromUuid: string = ""; //左边节点 接收
    private _time: number = 0;
    protected get time(): number {
        return this._time;
    }
    protected set time(value: number) {
        let dis = value - this.time;
        this.otherTime += dis;
        this._time = value;
    }
    protected otherTime: number = 0; //剩余时间
    protected startTime: number = 0; //开始时间
    private isRunning: boolean = false;
    private isStop: boolean = false;
    private effectTween: cc.Tween = null;

    onLoad() {

    }

    /**获取当前节点所有信息 */
    getBaseInfo() {
        return {
            curUuid: this._uuid,
            preUuid: this._fromUuid,
            nextUuid: this._toUuid,
            exportData: this._exportData
        }
    }

    bindFromUuid(uuid) {
        if (this._fromUuid && this._fromUuid !== uuid) { /**换绑 */
            this._preTween = null;
            this.sendTweenData(0);
        } else {
            this._fromUuid = uuid;
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

    updateView() {
        this.LineTo && (this.LineTo.color = this.node.color);
        this.LineFrom && (this.LineFrom.color = this.node.color);
        // this.Effect && (this.Effect.node.color = cc.Color.WHITE);
    }

    /** 每一个继承自此基类的组件都向main派发事件
     *  当节点移动时,触发时间
     */
    initEvent() {
        this.updateView();

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
        let data = {
            uuid: this._fromUuid,
            pos: pos
        }
        this.dispatchEvent("LineMove", data)
    }

    touchLineFromEnd(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }

        let pos = e.getLocation();

        /**判断是否有接触目标区域 */
        let data = {
            uuid: this._uuid,
            from_uuid: this._fromUuid,
            pos,
        }
        this.dispatchEvent("LineUnbind", data)
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
        if (this.isRunning) {
            event.stopPropagation();
            /**stop tween */
            return;
        }
        event['isBaseTouchMove'] = true;
        let x = event.getDeltaX();
        let y = event.getDeltaY();
        this.node.x += x;
        this.node.y += y;
        this.sendPosition();
    }

    touchEnd() {
        event.stopPropagation();
        if (this.isRunning) {
            let data = {
                uuid: this._uuid,
            }
            if (this.isStop) {
                this.isStop = false;
                this.resetEffectTween();
                this.dispatchEvent('tweenResume', data)
            } else {/**stop tween */
                this.isStop = true;
                this.effectTween.stop();
                this.otherTime -= (Date.now() - this.startTime) / 1000;
                this.dispatchEvent('tweenStop', data)
            }
            return;
        }
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

        let data = {
            uuid: this._uuid,
            toPos,
            fromPos
        }
        this.dispatchEvent('updatePos', data)
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
        let data = {
            uuid: this._uuid,
            pos,
            color: this.node.color
        }
        this.dispatchEvent('LineCreate', data)
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
        let data = {
            uuid: this._uuid,
            pos: pos
        }
        this.dispatchEvent('LineMove', data);
    }

    /**由子节点触发事件 */
    touchLineEnd(e) {
        e.stopPropagation();
        let pos = e.getLocation();
        if (this._toUuid) {
            return;
        }

        /**判断是否有接触目标区域 */
        let data = {
            uuid: this._uuid,
            pos: pos,
        }
        this.dispatchEvent('LineEnd', data)
    }

    /**处理循环引用 */
    receiveData(tweenData) {
        this._preTween = tweenData.clone();
        let flag = 0,
            targetName;
        this.sendTweenData(flag, targetName);
        if (this._tweenType === TweenType.START) {
            flag = 1;
            targetName = 'tweenStart'
            this.sendTweenData(flag, targetName);
        }
    }

    sendTweenData(isCustom?, targetName?) {
        targetName = targetName || "tweenData";

        let tween = this.returnData();
        let tweenData = this.getStandardTween(tween);
        let exportData = this._exportData;

        if (!isCustom) {
            // if (!this._toUuid) { //放开限制
            //     return;
            // }
        }

        let data = {
            preUuid: this._fromUuid,
            curUuid: this._uuid,
            nextUuid: this._toUuid,
            tweenData,
            exportData
        };
        this.dispatchEvent(targetName, data)
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
            return tween.then(oriTween).then(endTween).union().clone();
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
            });
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

        this.effectTween = cc.tween(this.Effect);
        this.effectTween
            .call(() => {
                cc.log("call")
                this.otherTime = this.time;
                this.startTime = Date.now();
                this.isStop = false;
                this.isRunning = true;
            })
            .to(this.time, {
                fillRange: 1
            })
            .call(() => {
                this.isStop = false;
                this.isRunning = false;
                this.Effect.node.active = false;
                this.otherTime = this.time;
            })
            .start();
    }

    resetEffectTween() {
        this.effectTween = cc.tween(this.Effect);
        this.effectTween
            .call(() => {
                this.startTime = Date.now();
            })
            .to(this.otherTime, {
                fillRange: 1
            })
            .call(() => {
                this.isStop = false;
                this.isRunning = false;
                this.Effect.node.active = false;
                this.otherTime = this.time;
            })
            .start();
    }

    endEffect() {
        // this.node.color = cc.Color.BLACK;
    }
    returnData(): cc.Tween { return cc.tween() }
    exportData() { }
}


