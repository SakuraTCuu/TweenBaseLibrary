const { ccclass, property } = cc._decorator;

@ccclass
export default class Line extends cc.Component {

    @property(cc.Graphics)
    Graphics: cc.Graphics = null;

    @property(cc.SpriteFrame)
    circleSpf: cc.SpriteFrame = null;

    startPoint: cc.Vec2 = cc.v2();

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
        // this.Graphics.bezierCurveTo(0, 0, 50, -50, 100, -100);
        // this.Graphics.stroke();
    }
    touchStart(event: cc.Event.EventTouch) {
        let pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        this.startPoint = cc.v2(pos);
        this.Graphics.clear();
    }

    touchMove(event: cc.Event.EventTouch) {
        this.Graphics.clear();
        let pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        let disX = pos.x - this.startPoint.x;
        let disY = pos.y - this.startPoint.y;

        let startPos = this.startPoint; // 当前获取的坐标是结束点
        let midX = disX / 2;
        let midY = disY / 2;
        this.Graphics.moveTo(startPos.x, startPos.y);
        this.Graphics.quadraticCurveTo(startPos.x + midX * 0.85, startPos.y + midY * 0.125, startPos.x + midX, startPos.y + midY);
        this.Graphics.quadraticCurveTo(startPos.x + midX * 1.15, startPos.y + midY * 1.875, pos.x, pos.y);
        this.Graphics.stroke();
    }
    touchEnd(event: cc.Event.EventTouch) {
        /**画球 */
        this.Graphics.clear();
        let pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        let disX = pos.x - this.startPoint.x;
        let disY = pos.y - this.startPoint.y;

        let startPos = this.startPoint; // 当前获取的坐标是结束点
        let midX = disX / 2;
        let midY = disY / 2;
        this.Graphics.moveTo(startPos.x, startPos.y);

        let curveX1 = startPos.x + midX * 0.85;
        let curveY1 = startPos.y + midY * 0.125;
        let midPosx = startPos.x + midX;
        let midPosy = startPos.y + midY;
        let curveX2 = startPos.x + midX * 1.15;
        let curveY2 = startPos.y + midY * 1.875;
        this.Graphics.quadraticCurveTo(curveX1, curveY1, midPosx, midPosy);
        this.Graphics.quadraticCurveTo(curveX2, curveY2, pos.x, pos.y);
        // this.Graphics.quadraticCurveTo(startPos.x + midX * 0.85, startPos.y + midY * 0.125, startPos.x + midX, startPos.y + midY);
        // this.Graphics.quadraticCurveTo(startPos.x + midX * 1.15, startPos.y + midY * 1.875, pos.x, pos.y);
        this.Graphics.stroke();

        /**画球 */

        let time = 2;

        this.Graphics.circle(startPos.x, startPos.y, 10);

    }

    runCircle(time) {
        /**创建一个圆 */
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this.circleSpf;
        // this.Graphics.circle(startPos.x, startPos.y, 10);

    }
}
