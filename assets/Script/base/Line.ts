const { ccclass, property } = cc._decorator;

@ccclass
export default class Line extends cc.Component {

    @property(cc.Graphics)
    Graphics: cc.Graphics = null;
    @property(cc.Graphics)
    Graphics2: cc.Graphics = null;

    startPoint: cc.Vec2 = cc.v2();

    c1: cc.Vec2 = null;
    c2: cc.Vec2 = null;
    c3: cc.Vec2 = null;
    c4: cc.Vec2 = null;

    onLoad() {
        // this.test();
        // this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
    }

    test() {
        this.c1 = cc.v2(cc.v2(100, 100));
        this.c2 = cc.v2(500, 100);
        this.c3 = cc.v2(-500, -100);
        this.c4 = cc.v2(-100, -100);
        this.drawLine();
    }

    // touchStart(event: cc.Event.EventTouch) {
    //     let pos = event.getLocation();
    //     pos = this.node.convertToNodeSpaceAR(pos);
    //     this.startPoint = cc.v2(pos);
    //     this.Graphics.clear();
    //     this.Graphics2.clear();
    //     this.unscheduleAllCallbacks();
    // }

    // touchMove(event: cc.Event.EventTouch) {
    //     this.Graphics.clear();
    //     let pos = event.getLocation();
    //     pos = this.node.convertToNodeSpaceAR(pos);
    //     this.drawBezier(pos, this.startPoint);
    // }

    // touchEnd(event: cc.Event.EventTouch) {
    //     this.Graphics.clear();
    //     this.Graphics2.clear();
    //     let endPos = event.getLocation();
    //     endPos = this.node.convertToNodeSpaceAR(endPos);
    //     this.drawBezier(endPos, this.startPoint);

    //     /**绘制两端球 */
    //     this.Graphics.circle(this.startPoint.x, this.startPoint.y, 10);
    //     this.Graphics.circle(endPos.x, endPos.y, 10);
    //     this.Graphics.stroke();

    //     /**绘制动态球 */
    //     this.runCircle(0.5);
    // }

    touchStart(pos) {
        // // let pos = event.getLocation();
        // pos = this.node.convertToNodeSpaceAR(pos);
        this.startPoint = cc.v2(pos);
        this.Graphics.clear();
        this.Graphics2.clear();
        this.unscheduleAllCallbacks();
    }

    touchMove(pos) {
        this.Graphics.clear();
        // let pos = event.getLocation();
        // pos = this.node.convertToNodeSpaceAR(pos);
        this.drawBezier(pos, this.startPoint);
    }

    touchEnd(flag, pos) {
        this.Graphics.clear();
        this.Graphics2.clear();
        if (!flag) {
            return;
        }
        this.drawBezier(pos, this.startPoint);
        /**绘制两端球 */
        // this.Graphics.circle(this.startPoint.x, this.startPoint.y, 10);
        // this.Graphics.circle(pos.x, pos.y, 10);
        // this.Graphics.stroke();
        /**绘制动态球 */
        this.runCircle(0.5);
    }

    /**
     * 绘制一条贝塞尔曲线
     * @param startPos
     * @param endPos 
     */
    drawBezier(endPos, startPos) {
        let disX = endPos.x - startPos.x;
        let disY = endPos.y - startPos.y;

        this.Graphics.moveTo(startPos.x, startPos.y);

        let curveX1 = startPos.x + disX * 0.7;
        let curveY1 = startPos.y + disY * 0.125;
        let curveX2 = startPos.x + disX * 0.3;
        let curveY2 = startPos.y + disY * 0.875;
        if (disX < 0) {
            curveX1 = startPos.x + Math.abs(disX) * 2;
            curveY1 = startPos.y + disY * 0.5;
            curveX2 = startPos.x - Math.abs(disX) * 3;
            curveY2 = endPos.y - disY * 0.5;
        }

        this.c1 = cc.v2(startPos);
        this.c2 = cc.v2(curveX1, curveY1);
        this.c3 = cc.v2(curveX2, curveY2);
        this.c4 = cc.v2(endPos);

        this.drawLine();
    }

    drawLine() {
        this.Graphics.moveTo(this.c1.x, this.c1.y);
        let t = 0;
        for (let i = 0; i < 59; i++) {
            t += 0.017;
            let position = this.threeBezier(t, this.c1, this.c2, this.c3, this.c4);
            this.Graphics.lineTo(position.x, position.y);
        }
        this.Graphics.stroke();
    }

    runCircle(time) {
        let t1 = 0;
        let arr = [];
        let len = time * 60;
        for (let i = 0; i < len; i++) {
            t1 += 0.017 * 1 / time;
            let position = this.threeBezier(t1, this.c1, this.c2, this.c3, this.c4);
            arr.push(position)
        }

        this.runRepeatCircle(arr);
    }

    runRepeatCircle(arr: Array<cc.Vec2>) {
        let len = arr.length - 1;
        let i1 = 0, i2 = 2, i3 = 4;
        this.schedule(() => {
            let c1 = arr[i1];
            let c2 = arr[i2];
            let c3 = arr[i3];
            this.Graphics2.clear();
            if (c1) {
                this.Graphics2.circle(c1.x, c1.y, 2);
            }
            if (c2) {
                this.Graphics2.circle(c2.x, c2.y, 4);
            }
            if (c3) {
                this.Graphics2.circle(c3.x, c3.y, 7);
            }
            this.Graphics2.stroke();
            this.Graphics2.fillColor = cc.Color.RED;
            this.Graphics2.fill();
            if (i1 >= len - 1) {
                /**新循环 */
                this.runRepeatCircle(arr);
            }
            i1++;
            i2++;
            i3++;
        }, 0.017, len - 1)
    }

    /**
    * @desc 三阶贝塞尔
    * @param {number} t 当前百分比
    * @param {cc.Vec2} p1 起点坐标
    * @param {cc.Vec2} p2 终点坐标
    * @param {cc.Vec2} cp1 控制点1
    * @param {cc.Vec2} cp2 控制点2
    */
    threeBezier(t, p1, cp1, cp2, p2) {
        let x1 = p1.x,
            y1 = p1.y,
            x2 = p2.x,
            y2 = p2.y,
            cx1 = cp1.x,
            cy1 = cp1.y,
            cx2 = cp2.x,
            cy2 = cp2.y;
        let x =
            x1 * (1 - t) * (1 - t) * (1 - t) +
            3 * cx1 * t * (1 - t) * (1 - t) +
            3 * cx2 * t * t * (1 - t) +
            x2 * t * t * t;
        let y =
            y1 * (1 - t) * (1 - t) * (1 - t) +
            3 * cy1 * t * (1 - t) * (1 - t) +
            3 * cy2 * t * t * (1 - t) +
            y2 * t * t * t;
        return cc.v2(x, y);
    }

    // 3阶贝塞尔曲线公式
    threebsr(t, a1, a2, a3, a4) {
        return a1 * (1 - t) * (1 - t) * (1 - t) + 3 * a2 * t * (1 - t) * (1 - t) + 3 * a3 * t * t * (1 - t) + a4 * t * t * t;
    }
}
