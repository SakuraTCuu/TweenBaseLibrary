import BaseParallelNode from "../base/BaseParallelNode";
import { TweenType } from "../base/Config";
import ParallelItem from "./ParallelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Parallel extends BaseParallelNode {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    bindNodeList: Array<cc.Node> = [];

    height: number = 0;
    originHeight: number = 0;//初始高度

    /**内部维护一个绑定关系, */

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

        this.sendPosition();
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
            arr.push(pos);
        }

        let data = {
            uuid: this._uuid,
            toPos,
            fromPos: arr
        }
        this.dispatchEvent('parallelPosInfo', data)
    }
}
