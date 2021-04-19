const { ccclass, property } = cc._decorator;

@ccclass
export default class ParallelItem extends cc.Component {

    @property(cc.Node)
    LineFrom: cc.Node = null;

    @property(cc.Node)
    Delete: cc.Node = null;

    _fromUuid: string = ""; //左边节点 接收
    _uuid: string = Date.now() + "";

    onLoad() {
        this.initEvent();
    }

    /**为uuid单独抽一个基类 */
    getUuid() {
        return this._uuid;
    }

    onClickDelete() {
        let name = 'delete';
        let data = {
            uuid: this._uuid,
        };
        this.dispatchEvent(name, data);
    }

    initEvent() {
        this.LineFrom.on(cc.Node.EventType.TOUCH_START, this.touchLineFromStart, this)
        this.LineFrom.on(cc.Node.EventType.TOUCH_MOVE, this.touchLineFromMove, this);
        this.LineFrom.on(cc.Node.EventType.TOUCH_END, this.touchLineFromEnd, this);
        this.LineFrom.on(cc.Node.EventType.TOUCH_CANCEL, this.touchLineFromEnd, this);
    }

    touchLineFromStart(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }
    }

    touchLineFromMove(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }
        let pos = e.getLocation();
        let data = {
            uuid: this._fromUuid,
            pos: pos
        }
        this.dispatchEvent("LineMove", data)
    }

    touchLineFromEnd(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this._fromUuid) {
            return;
        }

        let pos = e.getLocation();

        /**判断是否有接触目标区域 */
        let data = {
            from_uuid: this._fromUuid,
            pos,
        }
        this.dispatchEvent("LineUnbind", data)
    }

    /**send event */
    dispatchEvent(name, data) {
        let event = new cc.Event.EventCustom(name, true);
        event.detail = data;
        this.node.dispatchEvent(event);
    }

}
