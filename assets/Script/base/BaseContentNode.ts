import BaseOnceNode from "../base/BaseOnceNode";
import { TweenType } from "../base/Config";
import BaseTween from "./BaseTween";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseContentNode extends BaseOnceNode {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    Item2Prefab: cc.Prefab = null;

    bindNodeList: Array<cc.Node> = [];

    parallelData: {} = {};
    height: number = 0;
    originHeight: number = 0;//初始高度

    returnTween

    onLoad() {
        this.originHeight = this.node.height;
        this._tweenType = TweenType.PARALLEL;
        this.initEvent();

        this.node.on('delete', this.deleteItem, this);

        this.node.on('changeData', this.changeData, this);
    }

    changeData(e) {
        let { uuid, tween, tweenData } = e.getUserData();

        this.parallelData[uuid] = { tweenData, tween };

        let newTween: cc.Tween<cc.Node> = cc.tween();

        let result: Array<cc.Tween<cc.Node>> = new Array();
        // let result = {};
        let keys = Object.keys(this.parallelData);
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.parallelData, keys[key])) {
                let { tweenData, tween } = this.parallelData[keys[key]];
                result.push(tween);
                // result[tween] = tween;
            }
        }

        if (result.length === 1) {
            newTween.then(result[0]);
        } else if (result.length > 1) {
            //@ts-ignore  傻逼
            newTween.parallel(...result);
        }
        this.returnTween = newTween.clone();
        // this.returnTween.target(this.node).start();
        // newTween.parallel()
        cc.log(result);
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

    isFirst;
    /**点击添加 */
    onClickAdd() {
        let item;
        if (this.isFirst) {
            item = cc.instantiate(this.Item2Prefab);
        } else {
            item = cc.instantiate(this.ItemPrefab);
            this.isFirst = true;
        }
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseTween).getUuid();
        this.bindNodeList[uuid] = item;
        this.height = item.height + 10;
        /**重新计算高度 */
        this.resetHeight();

        this.sendPosition();
    }

    /**重置高度 */
    resetHeight() {
        let count = this.ContentNode.childrenCount;
        cc.log('reset->', count);
        let height = count * this.height;
        this.node.height = this.originHeight + height;
    }
}
