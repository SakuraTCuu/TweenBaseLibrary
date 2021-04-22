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

    bindNodeList: Array<cc.Node> = [];

    height: number = 0;
    originHeight: number = 0;//初始高度

    onLoad() {
        this.originHeight = this.node.height;
        this._tweenType = TweenType.PARALLEL;
        this.initEvent();

        this.node.on('delete', this.deleteItem, this);

        this.node.on('changeData', this.changeData, this);
    }

    changeData(e) {
        let data = e.getUserData();
        cc.log(data);
        this.returnData();
    }

    returnData() {
        /**从子节点获取数据,封装数据 */
        this.bindNodeList.forEach((item) => {
            let data = item.getComponent(BaseTween).returnData();
            cc.log(data);
        })

        return cc.tween();
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
        let item = cc.instantiate(this.ItemPrefab);
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseTween).getUuid();
        this.bindNodeList[uuid] = item;
        this.height = item.height + 10;
        /**重新计算高度 */
        this.resetHeight();

        this.sendTweenData();
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
