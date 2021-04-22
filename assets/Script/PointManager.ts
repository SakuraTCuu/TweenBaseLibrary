const { ccclass, property } = cc._decorator;

/**
 * 端点管理类
 * 负责处理所有的连接,断开,判断
 */
@ccclass
export default class PointManager extends cc.Component {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    pointInfo = {}; /**绑定关系 */
    bindInfo = [];

    onLoad() {
        this.node.on("LineEnd", this.endLine, this);
        this.node.on("updatePos", this.updatePos, this);
        this.node.on("updatePosMove", this.updatePosMove, this);
        this.node.on("LineUnbind", this.unBindLine, this);
    }

    /**解除绑定 */
    unBindLine(e) {
        //目标节点的uuid, 
        let { uuid, from_uuid, pos } = e.getUserData();
        //判断是否在某个区域内
        let { flag, type, tarPos, tarUuid } = this.isContains(from_uuid, pos);
        let uuid_to;
        if (flag) {
            if (from_uuid === tarUuid) {//无需变化
                return;
            }
            //更新bindInfo
            this.bindInfo.forEach((item) => {
                if (item.uuid_from == uuid) {
                    uuid_to = item.uuid_to;
                    item.uuid_from = tarUuid;
                }
            })
            tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
        } else {
            if (type) {
                tarPos = this.pointInfo[uuid].fromPos;
                tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
            } else {
                // this.unBindAll(uuid, null);
                let arr = [];
                this.bindInfo.forEach((item) => {
                    if (item.uuid_from !== uuid) {
                        arr.push(item);
                    } else {
                        tarUuid = item.uuid_to;
                        cc.log("移除一个")
                    }
                })
                this.bindInfo = arr;
            }
        }

        let data = {
            from_uuid, flag, type, tarPos, tarUuid
        }
        this.node.emit('LineUnbind2', data);
        let data2 = {
            flag, uuid, uuid_to, tarUuid, type
        }
        this.node.emit('unBindLine2', data2);
    }

    isContains(uuid: string, pos: cc.Vec2) {
        let keys = Object.keys(this.pointInfo);
        let type;
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.pointInfo, keys[key])) {
                const info = this.pointInfo[keys[key]];
                if (info.uuid === uuid) {
                    continue;
                };
                let rect = cc.rect(info.fromPos.x - 10, info.fromPos.y - 10, 20, 20);
                if (rect.contains(pos)) {
                    //判断是否已经存在了
                    let flag;
                    this.bindInfo.forEach((item) => {
                        if (item.uuid_from === info.uuid) {
                            flag = true;
                            type = 'repeat';
                        }
                    })
                    if (!flag) {
                        this.bindInfo.push({
                            uuid_to: uuid,
                            uuid_from: info.uuid,
                        });
                        return { flag: true, tarPos: info.fromPos, tarUuid: info.uuid };
                    }
                }
            }
        }

        return { flag: false, type };
    }


    /**TODO 处理循环引用 */
    endLine(e) {
        let { uuid, pos } = e.getUserData();
        let { flag, tarPos, tarUuid } = this.isContains(uuid, pos);
        if (flag) {
            let data = {
                uuid, tarUuid
            }
            this.node.emit('bindSuc', data);
        }

        if (tarPos) {
            tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
        }
        let data = {
            uuid, pos, flag, tarPos, tarUuid
        }
        this.node.emit('LineEnd2', data);
    }

    updatePos(e) {
        let { uuid, toPos, fromPos } = e.getUserData();
        // if (toPos) {
        //     cc.log("to:", toPos.x, toPos.y);
        // }
        // if (fromPos) {
        //     cc.log("from:", fromPos.x, fromPos.y);
        // }
        this.pointInfo[uuid] = {
            uuid, toPos, fromPos
        }

        /**更新链接 */
        for (let i = 0; i < this.bindInfo.length; i++) {
            const info = this.bindInfo[i];
            if (info.uuid_to === uuid) {
                let pos1 = this.ContentNode.convertToNodeSpaceAR(toPos);
                let pos2 = this.pointInfo[info.uuid_from].fromPos; //获取另一个点的位置并更新
                pos2 = this.ContentNode.convertToNodeSpaceAR(pos2);

                let data = {
                    uuid, pos1, pos2,
                }
                this.node.emit('updateLine', data);
            }

            if (info.uuid_from === uuid) {
                let pos1 = this.pointInfo[info.uuid_to].toPos;
                pos1 = this.ContentNode.convertToNodeSpaceAR(pos1);
                let pos2 = this.ContentNode.convertToNodeSpaceAR(fromPos);
                let data = {
                    uuid: info.uuid_to, pos1, pos2,
                }
                this.node.emit('updateLine', data);
            }
        }
    }

    updatePosMove(e) {
        let { x, y } = e;
        let keys = Object.keys(this.pointInfo);
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.pointInfo, keys[key])) {
                let info = this.pointInfo[keys[key]];
                if (info.toPos) {
                    info.toPos.addSelf(cc.v2(x, y));
                }
                if (info.fromPos) {
                    info.fromPos.addSelf(cc.v2(x, y));
                }
            }
        }
    }

}
