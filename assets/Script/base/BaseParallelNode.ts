import ParallelItem from "../action/ParallelItem";
import BaseNode from "./BaseNode";
import { TweenType, EasingType, TweenFlag, TypeColor } from "./Config";

const { ccclass, property } = cc._decorator;

/**转换头功能
 * 向左接收数据,绑定事件
 * 向右发送绑定事件,封装好的数据
 * 自身添加动作,删除动作等事件
 */
@ccclass
export default class BaseParallelNode extends BaseNode {

    @property(cc.Node)
    ContentNode: cc.Node = null;
    
    @property(cc.Node)
    LineTo: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    protected _tweenType: TweenType = TweenType.PARALLEL;/**type类型，用于标识是何种类型 */
    public get tweenType() {
        return this._tweenType;
    }
    public set tweenType(value) {
        this._tweenType = value;
    }
    protected export: boolean = false;
    protected _exportData = {};
    protected _preTween: cc.Tween = null; //上级传过来的tween
    protected _preData: [] = []; //上级传过来的tween 数据
    protected _uuid: string = Date.now() + "";//随机生成uuid 作为唯一标识 TODO Temp
    protected _toUuid: string = "";  //右边节点  to
    protected _fromUuid = []; //左边节点 接收
    bindNodeList: Array<cc.Node> = [];

    height: number = 0;
    originHeight: number = 0;//初始高度

    onLoad() {
        /** */
        this.originHeight = this.node.height;
        this._tweenType = TweenType.PARALLEL;
        this.initEvent();

        this.node.on('delete', this.deleteItem, this);
    }

     /**================================内部方法=================================== */
    /**删除一个item */
    deleteItem(e) {
        let { uuid } = e.getUserData();

        if (this.bindNodeList[uuid]) {
            this.bindNodeList[uuid].removeFromParent();
            delete this.bindNodeList[uuid];
        }
        /**重新计算高度 */
        this.resetHeight();

        this.sendPosition();
    }

    /**点击添加 */
    onClickAdd() {
        let item = cc.instantiate(this.ItemPrefab);
        item.parent = this.ContentNode;
        let uuid = item.getComponent(ParallelItem).getUuid();
        this.bindNodeList[uuid] = item;
        this.height = item.height;
        /**重新计算高度 */
        this.resetHeight();

        this.scheduleOnce(() => {
            this.sendPosition();
        }, 0.1);
    }

    /**重置高度 */
    resetHeight() {
        let count = this.ContentNode.childrenCount;
        cc.log('reset->', count);
        let height = count * this.height;
        this.node.height = this.originHeight + height;
    }

    sendPosition() {
        let toPos;
        if (this.LineTo) {
            toPos = this.node.convertToWorldSpaceAR(this.LineTo.position);
        }

        let arr = [];
        for (let i = 0; i < this.ContentNode.childrenCount; i++) {
            const item = this.ContentNode.children[i];
            let pos = item.getComponent(ParallelItem).getFromPos();
            arr.push(cc.v2(pos));
        }

        let data = {
            uuid: this._uuid,
            toPos,
            fromPos: arr
        }
        this.dispatchEvent('parallelPosInfo', data)
        this.dispatchEvent('updatePos', data)
    }

    getUuid() {
        return this._uuid;
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
        if (this._fromUuid.includes(uuid)) {
            return;
        }
        this._fromUuid.push(uuid);
        cc.log(this._fromUuid);
        this.sendTweenData(0);
    }

    unBindFromUuid(uuid) {
        if (!this._fromUuid.includes(uuid)) {
            return;
        }

        /**解绑后重新发送tweendata */
        this.sendTweenData(0);
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
        Object.assign(this._exportData, {
            tweenType: this.tweenType,
        });
    }

    /**每一个继承自此基类的组件都向main派发事件
     * 当节点移动时,触发时间
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

    touchMove(event: cc.Event.EventTouch) {
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
        let targetName;
        this.sendTweenData(targetName);
    }

    sendTweenData(targetName?) {
        targetName = targetName || "tweenData";

        let tweenData = this.getStandardTween(this.returnData());
        let exportData = this._exportData;

        let data = {
            preUuid: this._fromUuid,
            curUuid: this._uuid,
            nextUuid: this._toUuid,
            tweenData,
            exportData
        };
        this.dispatchEvent(targetName, data)
    }

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
                // this.startEffect();
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

    resetEffectTween() {

    }

    endEffect() {
        // this.node.color = cc.Color.BLACK;
    }
    returnData(): cc.Tween { return cc.tween() }
    exportData() { }
}
