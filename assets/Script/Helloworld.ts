import Line from "./base/Line";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    Background: cc.Node = null;

    @property(cc.Node)
    MainNode: cc.Node = null;

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    PositionPre: cc.Prefab = null;

    @property(cc.Prefab)
    LinePrefab: cc.Prefab = null;

    zIndex = 0;

    LineNode: cc.Node = null;
    toList: Array<cc.Vec2> = [];
    fromList: Array<cc.Vec2> = [];

    toFromInfo = {};
    bindInfo = []

    onLoad() {
        this.initView();
        this.initEvent();
    }

    initView() {
        /**创建矢量幕布 */
        this.Background
        this.addEvent(this.MainNode);
    }

    initEvent() {
        this.ContentNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.node.on("LineCreate", this.createLine, this);
        this.node.on("LineMove", this.moveLine, this);
        this.node.on("LineEnd", this.endLine, this);
        this.node.on("toFromInfo", this.toFromLogic, this);
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
                this.LineNode.getComponent(Line).touchStart(pos1);
                this.LineNode.getComponent(Line).touchEnd(true, pos2);
            }

            if (info.uuid_from === uuid) {
                let pos3 = this.toFromInfo[info.uuid_to].toPos;
                pos3 = this.ContentNode.convertToNodeSpaceAR(pos3);
                let pos4 = this.ContentNode.convertToNodeSpaceAR(fromPos);
                this.LineNode.getComponent(Line).touchStart(pos3);
                this.LineNode.getComponent(Line).touchEnd(true, pos4);
            }
        }
    }

    /**创建线条 */
    createLine(e) {
        let { uuid, pos } = e.getUserData();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        this.LineNode = cc.instantiate(this.LinePrefab);
        this.LineNode.getComponent(Line).touchStart(pos);
        this.LineNode.parent = this.ContentNode;
    }

    moveLine(e) {
        let { uuid, pos } = e.getUserData();
        pos = this.ContentNode.convertToNodeSpaceAR(pos);
        this.LineNode.getComponent(Line).touchMove(pos);
    }

    endLine(e) {
        let { uuid, pos, hook_cb } = e.getUserData();
        //判断是否在某个区域内
        let { flag, tarPos } = this.isContains(uuid, pos);
        if (flag) {
            tarPos = this.ContentNode.convertToNodeSpaceAR(tarPos);
        }
        this.LineNode.getComponent(Line).touchEnd(flag, tarPos);
        hook_cb & hook_cb(flag);
    }

    isContains(uuid: string, pos: cc.Vec2) {
        let keys = Object.keys(this.toFromInfo);
        for (const key in keys) {
            if (Object.prototype.hasOwnProperty.call(this.toFromInfo, keys[key])) {
                const info = this.toFromInfo[keys[key]];
                if (info.uuid === uuid) {
                    continue;
                };
                let rect = cc.rect(info.fromPos.x - 10, info.fromPos.y - 10, 20, 20);
                if (rect.contains(pos)) {
                    this.bindInfo.push({
                        uuid_to: uuid,
                        uuid_from: info.uuid,
                    });
                    return { flag: true, tarPos: info.fromPos };
                }
            }
        }
        return { flag: false };
    }

    onMouseUp(event) {
        event.stopPropagation();
        if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
            let pos = event.getLocation();
            pos = this.ContentNode.convertToNodeSpaceAR(pos);
            //展示列表
            let item = cc.instantiate(this.PositionPre);;
            item.position = pos
            item.parent = this.ContentNode;
            this.addEvent(item);
        }
    }

    touchMove(event: cc.Event.EventTouch) {
        event.stopPropagation();
        let x = event.getDeltaX();
        let y = event.getDeltaY();
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
                info.toPos.addSelf(cc.v2(x, y));
                info.fromPos.addSelf(cc.v2(x, y));
            }
        }
    }

    addEvent(node) {
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            node.zIndex = ++this.zIndex;
        }, this)
    }
    startTween() {
        let t1 = this.opacityTween();
        let t2 = this.scaleTween();

        let tween = cc.tween()
            .target(this.MainNode)
            .parallel(
                t1,
                t2
            )
        return tween.start();
    }

    opacityTween() {
        return cc.tween().to(0.5, {
            opacity: 0
        })
    }

    scaleTween() {
        return cc.tween().to(0.5, {
            scale: 2
        })
    }
}
