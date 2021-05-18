import Line from "./base/Line";

const { ccclass, property } = cc._decorator;

/**
 * 本脚本管理所有的line连接的两方的连接关系
 */

// type LineNodeListInfo<T> = {
//     [P in keyof T]?: T[P];
// };

@ccclass
export default class LineManager extends cc.Component {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    LinePrefab: cc.Prefab = null;

    LineNodeListInfo: cc.Node[] = [];
    bindInfo = [];

    onLoad() {
        this.node.on("LineCreate", this.createLine, this);
        this.node.on("LineMove", this.moveLine, this);
        this.node.on("LineEnd2", this.endLine, this);
        this.node.on("updateLine", this.updateLine, this);
        this.node.on("LineUnbind2", this.unBindLine, this);
    }

    createLine(e) {
        let { uuid, pos, color } = e.getUserData();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        let LineNode = cc.instantiate(this.LinePrefab);
        LineNode.getComponent(Line).touchStart(pos);
        LineNode.getComponent(Line).setColor(color);
        LineNode.parent = this.ContentNode;
        this.LineNodeListInfo[uuid] = LineNode;
    }

    moveLine(e) {
        let { uuid, pos } = e.getUserData();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        this.LineNodeListInfo[uuid].getComponent(Line).touchMove(pos);
    }

    /**TODO 处理循环引用 */
    endLine(e) {
        let { uuid, flag, tarPos, tarUuid } = e;
        if (flag) {
            /**更新线段 */
            this.LineNodeListInfo[uuid].getComponent(Line).touchEnd(flag, tarPos);
        } else {
            this.LineNodeListInfo[uuid].getComponent(Line).clear();
            this.LineNodeListInfo[uuid] = null;
            delete this.LineNodeListInfo[uuid];
        }
    }

    updateLine(e) {
        let { uuid, pos1, pos2 } = e;

        this.LineNodeListInfo[uuid].getComponent(Line).touchStart(pos1);
        this.LineNodeListInfo[uuid].getComponent(Line).touchEnd(true, pos2);
    }

    /**解除绑定 */
    unBindLine(e) {
        //目标节点的uuid, 
        let { tarUuid, from_uuid, type, flag, tarPos } = e;

        if (flag) {
            /**更新线段 */
            this.LineNodeListInfo[from_uuid].getComponent(Line).touchEnd(flag, tarPos);
        } else {
            if (type) {
                //返回原位置
                this.LineNodeListInfo[from_uuid].getComponent(Line).touchEnd(1, tarPos);
            } else {
                this.LineNodeListInfo[tarUuid].getComponent(Line).clear();
                this.LineNodeListInfo[tarUuid] = null;
                delete this.LineNodeListInfo[tarUuid];
            }
        }
    }
}
