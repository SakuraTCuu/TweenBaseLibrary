import BaseNode from "../base/BaseNode";
import { TweenType } from "../base/Config";
import ParallelItem from "./ParallelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Parallel extends BaseNode {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    bindNodeList: Array<cc.Node> = [];

    height: number = 0;
    originHeight: number = 0;//初始高度
    /**应该继承BaseNode 还是? */
    onLoad() {
        /** */
        this.originHeight = this.node.height;
        this._tweenType = TweenType.PARALLEL;
        this.color = '#00ff00'
        this.initEvent();

        this.node.on('delete', this.deleteItem, this);
    }
    /**删除一个item */
    deleteItem(e) {
        let { uuid } = e.getUserData();

        if (this.bindNodeList[uuid]) {
            cc.log("删除一个");
            let item = this.bindNodeList[uuid];
            // this.bindNodeList[uuid].removeChild(item);
            this.ContentNode.removeChild(item);
            this.bindNodeList[uuid].destroy();
            delete this.bindNodeList[uuid];
        }
        /**重新计算高度 */
        this.resetHeight();
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
    }

    /**重置高度 */
    resetHeight() {
        let count = this.ContentNode.childrenCount;
        cc.log('reset->', count);
        let height = count * this.height;
        this.node.height = this.originHeight + height;
    }
}
