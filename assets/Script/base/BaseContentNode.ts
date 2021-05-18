import BaseOnceNode from "../base/BaseOnceNode";
import { TweenType } from "../base/Config";
import BaseTween from "./BaseTween";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseContentNode extends BaseOnceNode {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Node)
    AddBtn: cc.Node = null;

    @property(cc.Prefab)
    TweenListPrefab: cc.Prefab = null;

    bindNodeList: Array<cc.Node> = [];

    parallelData: {} = {};
    height: number = 0;
    originHeight: number = 0;//初始高度

    TweenListNode: cc.Node;
    returnTween: cc.Tween = cc.tween();

    onLoad() {
        this.originHeight = this.node.height;
        this._tweenType = TweenType.PARALLEL;
        this.initEvent();

        this.node.on('delete', this.deleteItem, this);

        this.node.on('changeData', this.changeData, this);

        this.node.on('add', this.addItem, this);

        this.node.on('delete', this.delItem, this);

        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEndLogic, this);
    }

    start() {
        this.TweenListNode = cc.instantiate(this.TweenListPrefab);
        this.TweenListNode.parent = this.node;
        this.TweenListNode.active = false;
        super.start();
    }

    touchEndLogic() {
        this.TweenListNode.active = false;
    }

    changeData(e) {
        let { uuid, tween, tweenData } = e.getUserData();

        this.parallelData[uuid] = { tweenData, tween };

        let time = 0;
        let newTween = cc.tween();
        let resultTween: Array<cc.Tween<cc.Node>> = new Array();
        let resultData: Array<any> = new Array();
        let repeatTime = 1;
        let keys = Object.keys(this.parallelData);
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.parallelData, keys[key])) {
                let { tweenData, tween } = this.parallelData[keys[key]];
                if (tweenData.tweenType === TweenType.REPEAT) {
                    repeatTime = Number(tweenData.data.repeat);
                } else {
                    if (tweenData.time > time) {
                        time = tweenData.time;
                    }
                    resultTween.push(tween);
                    resultData.push(tweenData);
                }
            }
        }

        this.time = time;
        cc.log(this.time);
        if (resultTween.length === 1) {
            newTween.then(resultTween[0]);
        } else if (resultTween.length > 1) {
            // @ts-ignore  傻逼
            newTween.parallel(...resultTween);
        } else {
            return;
        }

        if (repeatTime && resultTween.length >= 1) {
            newTween.union().repeat(repeatTime);
            this.time = time * repeatTime;
        }

        Object.assign(this._exportData, {
            tweenType: this._tweenType,
            data: resultData,
            repeatTime
        })

        this.returnTween = newTween.clone();
        this.sendTweenData();
    }

    returnData() {
        /**从子节点获取数据,封装数据 */
        return this.returnTween;
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

        this.sendTweenData();
        this.sendPosition();
    }

    /**点击添加 */
    onClickAdd() {
        let pos = this.AddBtn.position;
        pos.x += this.TweenListNode.width / 2;
        this.TweenListNode.position = pos;
        this.TweenListNode.active = true;
    }

    addItem(e) {
        let { prefab } = e.getUserData();
        let item = cc.instantiate(prefab);
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseTween).getUuid();
        this.bindNodeList[uuid] = item;
        this.height = item.height;
        /**重新计算高度 */
        this.resetHeight();
        this.sendPosition();
    }

    delItem(e) {
        let { uuid } = e.getUserData();
        this.bindNodeList[uuid].destroy();
        delete this.bindNodeList[uuid];
        /**重新计算高度 */
        this.resetHeight();
        this.sendPosition();
    }

    /**重置高度 */
    resetHeight() {
        let count = this.ContentNode.childrenCount;
        let height = count * this.height;
        this.node.height = this.originHeight + height;
    }
}
