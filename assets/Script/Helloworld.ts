import BaseNode from "./base/BaseNode";
import Line from "./base/Line";

const { ccclass, property } = cc._decorator;

interface linkList {
    pre: string,
    cur: string,
    next: string
}
function linkList(pre, cur, next) {
    this.pre = pre;
    this.cur = cur;
    this.next = next;
}

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Camera)
    MainCamera: cc.Camera = null;

    @property(cc.Node)
    Background: cc.Node = null;

    @property(cc.Node)
    MainNode: cc.Node = null;

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    StartPre: cc.Prefab = null;

    @property(cc.Prefab)
    LinePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    PositionPre: cc.Prefab = null;
    @property(cc.Prefab)
    ScalePre: cc.Prefab = null;
    @property(cc.Prefab)
    AlphaPre: cc.Prefab = null;
    @property(cc.Prefab)
    AnglePre: cc.Prefab = null;
    @property(cc.Prefab)
    ColorPre: cc.Prefab = null;
    @property(cc.Node)
    TweenListNode: cc.Node = null;

    @property(cc.Sprite)
    Test: cc.Sprite = null;

    zIndex = 0;

    clickPos: cc.Vec3 = cc.v3();
    LineNodeListInfo = {};
    touchType: boolean = true;

    toFromInfo = {};
    /**
     * {
        uuid, toPos, fromPos
       }
     */
    bindInfo = [];

    NodeList = {};
    exportDataList: {} = {};

    onLoad() {
        this.initView();
        this.initEvent();
    }

    start() {
        let item = cc.instantiate(this.StartPre);
        item.position = cc.v3(500, 200);
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseNode).getUuid();
        this.NodeList[uuid] = item;
        this.addEvent(item);
    }

    initView() {
        this.ContentNode.setContentSize(10000, 10000);
        /**创建矢量幕布 */
        this.addEvent(this.MainNode);

        // this.scheduleOnce(() => {
        //     let t = cc.tween().to(2, { x: 400 });
        //     let t1 = cc.tween().to(2, { x: 0 });
        //     t.then(t1).target(this.MainNode).start();
        // }, 2);
    }

    initEvent() {
        this.ContentNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.ContentNode.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.ContentNode.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.ContentNode.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.node.on("LineCreate", this.createLine, this);
        this.node.on("LineMove", this.moveLine, this);
        this.node.on("LineEnd", this.endLine, this);
        this.node.on("toFromInfo", this.toFromLogic, this);
        this.node.on("LineUnbind", this.unBindLine, this);

        this.node.on("tweenData", this.receiveTweenData, this);
        this.node.on("tweenStart", this.tweenStart, this);
    }

    /**解除绑定 */
    unBindLine(e) {
        //目标节点的uuid, 
        let { uuid, from_uuid, pos } = e.getUserData();
        //判断是否在某个区域内
        let { flag, type, tarPos, tarUuid } = this.isContains(from_uuid, pos);

        if (flag) {
            if (from_uuid === tarUuid) {//无需变化
                return;
            }
            //解绑 from_uuid
            this.NodeList[uuid].getComponent(BaseNode).unBindFromUuid();
            let uuid_to;
            //更新bindInfo
            this.bindInfo.forEach((item) => {
                if (item.uuid_from == uuid) {
                    uuid_to = item.uuid_to;
                    item.uuid_from = tarUuid;
                }
            })
            tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
            /**更新线段 */
            this.LineNodeListInfo[from_uuid].getComponent(Line).touchEnd(flag, tarPos);
            /**绑定到同一个*/
            /**重新绑定新的 */
            this.NodeList[uuid_to].getComponent(BaseNode).bindToUuid(tarUuid);
            this.NodeList[tarUuid].getComponent(BaseNode).bindFromUuid(uuid_to);
        } else {
            if (type) {
                tarPos = this.toFromInfo[uuid].fromPos;
                tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
                //返回原位置
                this.LineNodeListInfo[from_uuid].getComponent(Line).touchEnd(1, tarPos);
            } else {
                this.unBindAll(uuid, null);
            }
        }
    }

    unBindAll(uuid, tarUuid) {
        cc.log('unbind')
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

        this.deleteExportData(tarUuid);

        //解绑
        this.NodeList[uuid].getComponent(BaseNode).unBindFromUuid();
        this.NodeList[tarUuid].getComponent(BaseNode).unBindToUuid();

        /**解绑完成后发送消息 */
        this.LineNodeListInfo[tarUuid].getComponent(Line).clear();
        this.LineNodeListInfo[tarUuid] = null;

        delete this.LineNodeListInfo[tarUuid];
    }

    /** 删除 可达性 */
    deleteExportData(index) {
        if (this.exportDataList[index]) {
            let preIndex = this.exportDataList[index].preUuid;
            this.deleteExportData(preIndex);
            cc.log('delete uuid:', index);
            delete this.exportDataList[index];
        }
    }

    addExportData(curIndex, preIndex) {
        if (preIndex && !this.exportDataList[preIndex]) {
            let { curUuid, preUuid, nextUuid, exportData } = this.NodeList[preIndex].getComponent(BaseNode).getBaseInfo();
            if (nextUuid !== curIndex) {
                cc.error("preUuid is no bind");
                return;
            }
            this.exportDataList[curUuid] = {
                preUuid,
                exportData,
                nextUuid
            };
            this.addExportData(curUuid, preUuid);
        }
    }

    parseExportData() {
        /**寻找没有pre的那一个就是最开始的 */
        let index;
        for (const key in this.exportDataList) {
            if (Object.prototype.hasOwnProperty.call(this.exportDataList, key)) {
                const pre = this.exportDataList[key].preUuid;
                if (!pre) {
                    index = key;
                    break;
                }
            }
        }

        cc.log(index);
        let result = [];
        while (index && index !== -1 && this.exportDataList[index]) {
            let data = this.exportDataList[index].exportData;
            result.push(data);
            index = this.exportDataList[index].nextUuid;
        }
        return result;
    }

    receiveTweenData(e) {
        //目标节点的uuid,
        let { preUuid, curUuid, nextUuid, tweenData, exportData } = e.getUserData();

        let item = this.NodeList[nextUuid];
        if (!item) {
            cc.log("error, tarUuid not found");
            return;
        }

        item.getComponent(BaseNode).receiveData(tweenData);

        /**存储数据*/
        /**todo 双链表存储数据 */
        this.exportDataList[curUuid] = {
            preUuid,
            exportData,
            nextUuid
        }

        /**沿着preUuid一直遍历到头 看exportData里是否有记录uuid*/
        this.addExportData(curUuid, preUuid);
    }

    tweenStart(e) {
        let { tarUuid, tweenData } = e.getUserData();
        this.MainNode.stopAllActions();
        tweenData = tweenData as cc.Tween;
        tweenData
            .target(this.MainNode)
            .call(() => {
                /**重置 */
                this.resetTween();
            })
            // .repeatForever(tweenData) /**重复执行 */
            .start();
        cc.log(this.exportDataList);
        /**解析数据 */
        /**延后 */
        setTimeout(()=>{
            let data = this.parseExportData();
            cc.log(data)
        })
    }

    resetTween() {
        this.MainNode.position = cc.v3(500, 0);
        this.MainNode.scale = 1;
        this.MainNode.opacity = 255;
        this.MainNode.angle = 0;
        this.MainNode.color = cc.color(255, 255, 255, 255);
    }

    toFromLogic(e) {
        let { uuid, toPos, fromPos } = e.getUserData();
        this.toFromInfo[uuid] = {
            uuid, toPos, fromPos
        }

        /**更新链接 */
        for (let i = 0; i < this.bindInfo.length; i++) {
            const info = this.bindInfo[i];
            if (info.uuid_to === uuid) {
                let pos1 = this.ContentNode.convertToNodeSpaceAR(toPos);
                let pos2 = this.toFromInfo[info.uuid_from].fromPos; //获取另一个点的位置并更新
                pos2 = this.ContentNode.convertToNodeSpaceAR(pos2);
                this.LineNodeListInfo[uuid].getComponent(Line).touchStart(pos1);
                this.LineNodeListInfo[uuid].getComponent(Line).touchEnd(true, pos2);
            }

            if (info.uuid_from === uuid) {
                let pos3 = this.toFromInfo[info.uuid_to].toPos;
                pos3 = this.ContentNode.convertToNodeSpaceAR(pos3);
                let pos4 = this.ContentNode.convertToNodeSpaceAR(fromPos);
                this.LineNodeListInfo[info.uuid_to].getComponent(Line).touchStart(pos3);
                this.LineNodeListInfo[info.uuid_to].getComponent(Line).touchEnd(true, pos4);
            }
        }
    }

    /**创建线条 */
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
        let { uuid, pos } = e.getUserData();
        //TODO 判断是否循环引用

        //判断是否在某个区域内
        let { flag, tarPos, tarUuid } = this.isContains(uuid, pos);
        if (flag) {
            tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
            /**更新线段 */
            this.LineNodeListInfo[uuid].getComponent(Line).touchEnd(flag, tarPos);
            /**绑定到同一个*/
            /**更新节点 */
            this.NodeList[uuid].getComponent(BaseNode).bindToUuid(tarUuid);
            this.NodeList[tarUuid].getComponent(BaseNode).bindFromUuid(uuid);

            /**更新引用关系啊,不能忘啊 */
            if (this.exportDataList[tarUuid]) {
                this.exportDataList[tarUuid]['preUuid'] = uuid;
            }

        } else {
            this.LineNodeListInfo[uuid].getComponent(Line).clear();
            this.LineNodeListInfo[uuid] = null;
            delete this.LineNodeListInfo[uuid];
        }
    }

    isContains(uuid: string, pos: cc.Vec2) {
        let keys = Object.keys(this.toFromInfo);

        let type;

        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.toFromInfo, keys[key])) {
                const info = this.toFromInfo[keys[key]];
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

    onMouseDown(event) {
        event.stopPropagation();
        if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
            this.touchType = true;
        }
    }


    addZoomRatio() {
        this.MainCamera.zoomRatio += 0.05;
        if (this.MainCamera.zoomRatio > 1.5) {
            this.MainCamera.zoomRatio = 1.5;
        }
    }

    subZoomRatio() {
        this.MainCamera.zoomRatio -= 0.05;
        if (this.MainCamera.zoomRatio < 0.5) {
            this.MainCamera.zoomRatio = 0.5
        }
    }

    onMouseWheel(event) {
        let y = event.getScrollY();
        if (y > 0) {
            this.MainCamera.zoomRatio += 0.02;
        } else {
            this.MainCamera.zoomRatio -= 0.02;
        }

        if (this.MainCamera.zoomRatio < 0.5) {
            this.MainCamera.zoomRatio = 0.5
        }
        if (this.MainCamera.zoomRatio > 1.5) {
            this.MainCamera.zoomRatio = 1.5;
        }
        cc.log(this.MainCamera.zoomRatio);
    }

    onMouseUp(event) {
        event.stopPropagation();
        if (this.touchType && event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
            let pos = event.getLocation();
            pos = this.ContentNode.convertToNodeSpaceAR(pos);
            this.clickPos = pos;
            this.TweenListNode.position = pos;
            this.TweenListNode.active = true;
            /**展示List */
            // let item = cc.instantiate(this.PositionPre);
            // item.position = pos;
            // item.parent = this.ContentNode;
            // let uuid = item.getComponent(BaseNode).getUuid();
            // this.NodeList[uuid] = item;
            // this.addEvent(item);
        }
    }

    /**
     * baseNode的事件未被拦截
     * 因为baseNode移动后 会触发 mouse 的up down 事件,而且无法判断
     * 那就让baseNode的事件透传过来, 然后定义一个isBaseTouchMove标识 是经由baseNode传递过来的
     * 这里就可以修改touchType 来判断是否是移动背景还是生成 
     * 三个事件互不影响
     * @param event 
     */
    touchMove(event: cc.Event.EventTouch) {
        this.TweenListNode.active = false;
        event.stopPropagation();
        let x = event.getDeltaX();
        let y = event.getDeltaY();
        if (event['isBaseTouchMove']) { //是baseNode的移动事件,不需要处理
            return this.touchType = false;
        }
        if (event.getDelta().mag() > 10) {
            this.touchType = false;
        }
        this.updateToFromPos(x, y);
        this.ContentNode.x += x;
        this.ContentNode.y += y;
        if (this.ContentNode.x > 4000) {
            this.ContentNode.x = 4000;
        }
        if (this.ContentNode.x < -4000) {
            this.ContentNode.x = -4000;
        }
        if (this.ContentNode.y > 4000) {
            this.ContentNode.y = 4000;
        }
        if (this.ContentNode.y < -4000) {
            this.ContentNode.y = -4000;
        }
    }

    /**背景位置变动后,更新所有世界坐标 */
    updateToFromPos(x, y) {
        let keys = Object.keys(this.toFromInfo);
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.toFromInfo, keys[key])) {
                let info = this.toFromInfo[keys[key]];
                if (info.toPos) {
                    info.toPos.addSelf(cc.v2(x, y));
                }
                if (info.fromPos) {
                    info.fromPos.addSelf(cc.v2(x, y));
                }
            }
        }
    }

    addEvent(node) {
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            node.zIndex = ++this.zIndex;
        }, this)
    }

    /**创建一个tween节点 */
    createTweenNode(prefab: cc.Prefab) {
        // let pos = event.getLocation();
        let pos = this.clickPos;
        let item = cc.instantiate(prefab);
        item.position = pos;
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseNode).getUuid();
        this.NodeList[uuid] = item;
        this.addEvent(item);
    }

    onClickTweenList(event, type) {
        this.TweenListNode.active = false;
        switch (type) {
            case 'position':
                this.createTweenNode(this.PositionPre);
                break;
            case 'scale':
                this.createTweenNode(this.ScalePre);
                break;
            case 'opacity':
                this.createTweenNode(this.AlphaPre);
                break;
            case 'angle':
                this.createTweenNode(this.AnglePre);
                break;
            case 'color':
                this.createTweenNode(this.ColorPre);
                break;
            case 'sequence':
                alert('开发中...')
                break;
            case 'parallel':
                alert('开发中...')
                break;
            case 'repeat':
                alert('开发中...')
                break;

        }
    }
}
