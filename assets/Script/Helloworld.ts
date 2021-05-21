import AudioMgr from "./AudioManager";
import BaseOnceNode from "./base/BaseOnceNode";
import EasingList from "./EasingList";
import Global from "./Global";
import TweenParseManager from "./TweenParseManager";

const { ccclass, property } = cc._decorator;

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
    ContentPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    DelayPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    CallPrefab: cc.Prefab = null;

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
    TypeListNode: cc.Node = null;
    @property(cc.Node)
    EasingListNode: cc.Node = null;

    @property(cc.AudioClip)
    audio1: cc.AudioClip = null;
    @property(cc.AudioClip)
    audio2: cc.AudioClip = null;

    zIndex = 0;
    clickPos: cc.Vec3 = cc.v3();
    touchType: boolean = true;
    NodeList: cc.Node[] = [];
    exportDataList: {} = {};

    onLoad() {
        this.initView();
        this.initEvent();
    }

    start() {
        this.EasingListNode.zIndex = 999;
        let item = cc.instantiate(this.StartPre);
        item.position = cc.v3(500, 200);
        item.parent = this.ContentNode;
        let uuid = item.getComponent(BaseOnceNode).getUuid();
        this.NodeList[uuid] = item;
        this.addEvent(item);
    }

    initView() {
        this.ContentNode.setContentSize(10000, 10000);
        /**创建矢量幕布 */
        this.addEvent(this.MainNode);
    }

    initEvent() {
        this.ContentNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.ContentNode.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.ContentNode.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.ContentNode.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.node.on('bindSuc', this.bindSuc, this)
        this.node.on("unBindLine2", this.unBindLine, this);
        this.node.on("showEasing", this.showEasing, this);
        this.node.on('destroy', this.ItemDestroy, this);

        this.node.on("tweenData", this.receiveTweenData, this);
        this.node.on("tweenStart", this.tweenStart, this);
        this.node.on("tweenResume", this.tweenResume, this);
        this.node.on("tweenStop", this.tweenStop, this);
    }

    /**删除节点 */
    ItemDestroy(e) {
        let { uuid, from_uuid, to_uuid, pos } = e.getUserData();

        this.NodeList[to_uuid]?.getComponent(BaseOnceNode).unBindFromUuid();
        this.NodeList[uuid]?.getComponent(BaseOnceNode).unBindFromUuid();
        this.NodeList[from_uuid]?.getComponent(BaseOnceNode).unBindToUuid();
        // this.NodeList[uuid].getComponent(BaseOnceNode).bindFromUuid(uuid);
        /**延迟删除 */
        this.scheduleOnce(() => {
            this.NodeList[uuid].destroy();
            this.NodeList[uuid] = null;
            delete this.NodeList[uuid];
        }, 0.017)

        this.exportDataList[uuid] = null;
        delete this.exportDataList[uuid];
    }

    /**绑定成功 */
    bindSuc(e) {
        let { uuid, tarUuid } = e;
        /**绑定到同一个*/
        /**更新节点 */
        this.NodeList[uuid].getComponent(BaseOnceNode).bindToUuid(tarUuid);
        this.NodeList[tarUuid].getComponent(BaseOnceNode).bindFromUuid(uuid);

        /**更新引用关系啊,不能忘啊 */
        if (this.exportDataList[tarUuid]) {
            this.exportDataList[tarUuid]['preUuid'] = uuid;
        }
    }

    /**解除绑定 */
    unBindLine(e) {
        //目标节点的uuid, 
        let { flag, uuid, uuid_to, tarUuid, type } = e;

        if (flag) {
            this.NodeList[uuid]?.getComponent(BaseOnceNode).unBindFromUuid();
            /**绑定到同一个*/
            /**重新绑定新的 */
            this.NodeList[uuid_to]?.getComponent(BaseOnceNode).bindToUuid(tarUuid);
            this.NodeList[tarUuid]?.getComponent(BaseOnceNode).bindFromUuid(uuid_to);
        } else {
            if (!type) {
                cc.log('unbind')
                this.deleteExportData(tarUuid);
                //解绑
                this.NodeList[uuid]?.getComponent(BaseOnceNode).unBindFromUuid();
                this.NodeList[tarUuid]?.getComponent(BaseOnceNode).unBindToUuid();
            }
        }
    }

    /**================数据相关========================== */
    tweenResume() {
        this.MainNode.resumeAllActions();
    }

    tweenStop() {
        this.MainNode.pauseAllActions();
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
            let { curUuid, preUuid, nextUuid, exportData } = this.NodeList[preIndex].getComponent(BaseOnceNode).getBaseInfo();
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
            // cc.log("error, tarUuid not found");
            return;
        }

        item.getComponent(BaseOnceNode).receiveData(tweenData);

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
                /** 重置 */
                this.resetTween();
            })
            // .repeatForever(tweenData) /**重复执行 */
            .start();
        /**延后解析数据 */
        setTimeout(() => {
            let data = this.parseExportData();
            // cc.log(JSON.stringify(data))
            let tween = TweenParseManager.getTweenByData(data);
            tween.target(this.MainNode)
                .on('test', this.test.bind(this))
                // .ccc(this)
                .call(() => {
                    /** 重置 */
                    this.resetTween();
                })
            // .start();
        })
    }

    frameCallBack(key) { }
    test() { cc.log(this.MainNode); }
    stop() { }
    resume() { }

    /**展示缓动列表 */
    showEasing(e) {
        let { pos, hook_cb } = e.getUserData();
        // let item = cc.instantiate(this.EasingPrefab);
        // item.parent = this.ContentNode;
        this.EasingListNode.active = true;
        this.EasingListNode.position = this.ContentNode.convertToNodeSpaceAR(pos);
        this.EasingListNode.getComponent(EasingList).showView(hook_cb);
    }

    resetTween() {
        this.MainNode.position = cc.v3(500, 0);
        this.MainNode.scale = 1;
        this.MainNode.opacity = 255;
        this.MainNode.angle = 0;
        this.MainNode.color = cc.color(255, 255, 255, 255);
    }

    /**====================界面相关=================================== */
    onMouseDown(event) {
        event.stopPropagation();
        if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
            this.touchType = true;
        }
    }

    resetZoomRatio() {
        // this.MainCamera.zoomRatio = 1;
        this.ContentNode.scale = 1;

        /**更新 */
        for (const key in this.NodeList) {
            if (Object.prototype.hasOwnProperty.call(this.NodeList, key)) {
                const item = this.NodeList[key];
                item.getComponent(BaseOnceNode).sendPosition();
            }
        }
    }

    /**通过缩放节点来实现
     * 而非 调整摄像机zoomRatio ,zoom缩放比例和实际坐标计算存在误差
     */
    addZoomRatio() {
        this.ContentNode.scale += 0.05;
        if (this.ContentNode.scale > 1.5) {
            this.ContentNode.scale = 1.5;
        }
        /**更新 */
        for (const key in this.NodeList) {
            if (Object.prototype.hasOwnProperty.call(this.NodeList, key)) {
                const item = this.NodeList[key];
                item.getComponent(BaseOnceNode).sendPosition();
            }
        }

        // this.MainCamera.zoomRatio += 0.05;
        // if (this.MainCamera.zoomRatio > 1.5) {
        //     this.MainCamera.zoomRatio = 1.5;
        // }
        // Global.zoomRatio = 2 - this.MainCamera.zoomRatio;
        // cc.log(Global.zoomRatio)
    }

    subZoomRatio() {
        this.ContentNode.scale -= 0.05;
        if (this.ContentNode.scale < 0.5) {
            this.ContentNode.scale = 0.5;
        }

        /**更新 */
        for (const key in this.NodeList) {
            if (Object.prototype.hasOwnProperty.call(this.NodeList, key)) {
                const item = this.NodeList[key];
                item.getComponent(BaseOnceNode).sendPosition();
            }
        }

        // this.MainCamera.zoomRatio -= 0.05;
        // if (this.MainCamera.zoomRatio < 0.5) {
        //     this.MainCamera.zoomRatio = 0.5
        // }
        // Global.zoomRatio = 2 - this.MainCamera.zoomRatio;
        // cc.log(Global.zoomRatio)
    }

    /**滚轮缩放 mac触摸板禁用 */
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
        // cc.log(this.MainCamera.zoomRatio);
    }

    onMouseUp(event: cc.Event.EventMouse) {
        event.stopPropagation();
        if (this.touchType && event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
            let pos = event.getLocation();
            // cc.log(pos.x, pos.y);
            // pos = pos.multiply(cc.v2(Global.zoomRatio, 1));
            pos = this.ContentNode.convertToNodeSpaceAR(pos);
            /**手动计算本地坐标位置 还是不太对*/
            // let x = pos.x - this.node.width / 2;
            // let y = pos.y - this.node.height / 2;
            // x *= Global.zoomRatio;
            // y *= Global.zoomRatio;
            // // cc.log(x, y);
            // pos = cc.v2(x, y);
            // cc.log(pos.x, pos.y);

            // let contentItem = cc.instantiate(this.ContentPrefab);
            // contentItem.parent = this.ContentNode;
            // contentItem.position = cc.v3(pos);
            // let uuid = contentItem.getComponent(BaseOnceNode).getUuid();
            // this.NodeList[uuid] = contentItem;
            // this.addEvent(contentItem);

            this.TypeListNode.position = cc.v3(pos);
            this.TypeListNode.active = true;
        }
    }

    showBaseContent(event) {
        let pos = event.getLocation();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        let contentItem = cc.instantiate(this.ContentPrefab);
        contentItem.parent = this.ContentNode;
        contentItem.position = cc.v3(pos);
        let uuid = contentItem.getComponent(BaseOnceNode).getUuid();
        this.NodeList[uuid] = contentItem;
        this.addEvent(contentItem);
    }

    showDelayContent(event) {
        let pos = event.getLocation();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        let contentItem = cc.instantiate(this.DelayPrefab);
        contentItem.parent = this.ContentNode;
        contentItem.position = cc.v3(pos);
        let uuid = contentItem.getComponent(BaseOnceNode).getUuid();
        this.NodeList[uuid] = contentItem;
        this.addEvent(contentItem);
    }

    showCallContent(event) {
        let pos = event.getLocation();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        let contentItem = cc.instantiate(this.CallPrefab);
        contentItem.parent = this.ContentNode;
        contentItem.position = cc.v3(pos);
        let uuid = contentItem.getComponent(BaseOnceNode).getUuid();
        this.NodeList[uuid] = contentItem;
        this.addEvent(contentItem);
    }

    onClickTypeList(event, type) {
        this.TypeListNode.active = false;
        switch (type) {
            case 'parallel':
                this.showBaseContent(event);
                break;
            case 'delay':
                this.showDelayContent(event);
                break;
            case 'call':
                this.showCallContent(event);
                break;
        }
    }

    /**
     * BaseOnceNode的事件未被拦截
     * 因为BaseOnceNode移动后 会触发 mouse 的up down 事件,而且无法判断
     * 那就让BaseOnceNode的事件透传过来, 然后定义一个isBaseTouchMove标识 是经由BaseOnceNode传递过来的
     * 这里就可以修改touchType 来判断是否是移动背景还是生成 
     * 三个事件互不影响
     * @param event 
     */
    touchMove(event: cc.Event.EventTouch) {
        this.TypeListNode.active = false;
        this.EasingListNode.active = false;
        event.stopPropagation();
        let x = event.getDeltaX() * Global.zoomRatio;
        let y = event.getDeltaY() * Global.zoomRatio;
        if (event['isBaseTouchMove']) { //是BaseOnceNode的移动事件,不需要处理
            return this.touchType = false;
        }
        if (event.getDelta().mag() > 10) {
            this.touchType = false;
        }
        this.updateToFromPos(x, y);
        // this.MainCamera.node.x -= x;
        // this.MainCamera.node.y -= y;
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
        let data = {
            x, y
        };
        this.node.emit("updatePosMove", data);
    }

    addEvent(node) {
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            node.zIndex = ++this.zIndex;
        }, this)
    }
}
