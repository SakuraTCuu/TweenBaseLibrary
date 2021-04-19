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

    color: any = '#00ff00';
    endPos: cc.Vec2 = cc.v2();
    startPos: cc.Vec2 = cc.v2();
    midPos: cc.Vec2 = cc.v2();
    midPos2: cc.Vec2 = cc.v2();
    r: number = 0;/**半径 */
    disX: number = 0; /**间距x */
    /**曲线还是半圆 */
    isCurve: boolean = true;

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
    //     this.runCurve(0.5);
    // }

    setColor(color) {
        // this.color = color;
        this.Graphics.strokeColor = cc.color(this.color);
        this.Graphics.fillColor = cc.color(this.color);
        this.Graphics2.strokeColor = cc.color(this.color);
        this.Graphics2.fillColor = cc.color(this.color);
    }

    clear() {
        this.Graphics.clear(true);
        this.Graphics2.clear(true);
        this.unscheduleAllCallbacks();
    }
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
        this.unscheduleAllCallbacks();
        this.Graphics2.clear();
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
        if (this.isCurve) {
            this.runCurve(1);
        } else {
            this.runCircle(1);
        }
    }

    /**
     * 绘制一条贝塞尔曲线
     * @param startPos
     * @param endPos 
     */
    drawBezier(endPos, startPos) {
        this.endPos = endPos;
        this.startPos = startPos;
        let disX = endPos.x - startPos.x;
        let disY = endPos.y - startPos.y;

        let curveX1 = startPos.x + disX * 0.7;
        let curveY1 = startPos.y + disY * 0.125;
        let curveX2 = startPos.x + disX * 0.3;
        let curveY2 = startPos.y + disY * 0.875;
        if (disX < 0) {
            this.isCurve = false;
            // curveX1 = startPos.x + Math.abs(disX) * 2;
            // curveY1 = startPos.y + disY * 0.5;
            // curveX2 = startPos.x - Math.abs(disX) * 3;
            // curveY2 = endPos.y - disY * 0.5;

            /**中间用贝塞尔曲线,两端画半圆 */
            let midY = disY / 2;
            // let midX = disX / 2;

            let cx1 = startPos.x;
            let cy1 = startPos.y;
            let cx2 = endPos.x;
            let cy2 = endPos.y;
            let r = Math.abs(midY / 2);
            this.r = r;
            this.disX = disX;
            this.midPos = cc.v2(cx1, cy1 + midY / 2);
            this.midPos2 = cc.v2(cx2, cy2 - midY / 2);
            /**绘制第一个半圆 */
            this.Graphics.arc(cx1, cy1 + midY / 2, r, 0 - Math.PI / 2, Math.PI / 2, true);
            this.Graphics.stroke();
            this.Graphics.moveTo(cx1, cy1 + midY);
            this.Graphics.lineTo(cx2, cy1 + midY);
            this.Graphics.stroke();
            /**画第二个半圆 */
            this.Graphics.arc(cx2, cy2 - midY / 2, r, 0 - Math.PI / 2, Math.PI / 2, false)
            this.Graphics.stroke();
        } else {
            this.isCurve = true;
            this.c1 = cc.v2(startPos);
            this.c2 = cc.v2(curveX1, curveY1);
            this.c3 = cc.v2(curveX2, curveY2);
            this.c4 = cc.v2(endPos);

            this.drawLine();
        }
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

    /**路径是弧线 */
    runCurve(time) {
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

    /**路径是半圆 */
    runCircle(time) {
        /**获取圆形的周长和直线的长度,计算各自分配的时间 */
        let circleLen = Math.PI * this.r;
        let lineLen = Math.abs(this.disX);
        let circleTime = circleLen / (circleLen + lineLen) * time;
        let lineTime = time - circleTime;
        let halfCircleTime = circleTime / 2;
        cc.log(lineTime, halfCircleTime)

        let disY = this.endPos.y - this.startPos.y;
        let flag;
        if (disY > 0) {
            flag = true;
        }

        let t1 = 0;
        let arr = [];
        let len = halfCircleTime * 60;
        // len /= 3;
        /**push 第一个半圆形路径 */
        for (let i = 0; i < len; i++) {
            t1 += 0.017 * 1 / halfCircleTime;
            let position = this.halfCircle(t1, this.r, 0);
            if (flag) { /**翻转Y */
                position.y = -position.y
            }
            position = this.midPos.add(position);
            arr.push(position);

        }

        /**直线路径 */
        let position = this.startPos.add(cc.v2(0, disY / 2));
        len = lineTime * 50;
        t1 = 0;
        for (let i = 0; i < len; i++) {
            // t1 += 0.017 * 1 / lineTime;
            let distance = Math.abs(this.disX) / len * i;
            let pos = position.sub(cc.v2(distance, 0));
            arr.push(pos);
        }

        len = halfCircleTime * 60;
        t1 = 0;
        /** 第二个半圆形路径 */
        for (let i = 0; i < len; i++) {
            t1 += 0.017 * 1 / halfCircleTime;
            let position = this.halfCircle(t1, this.r, 0);
            if (flag) { /**翻转Y */
                position.y = -position.y
            }
            position.x = -position.x;/**翻转x */
            position = this.midPos2.add(position);
            arr.push(position)
        }
        cc.log(arr.length);
        cc.log(Date.now());
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
                this.Graphics2.circle(c1.x, c1.y, 4);
            }
            if (c2) {
                this.Graphics2.circle(c2.x, c2.y, 6);
            }
            if (c3) {
                this.Graphics2.circle(c3.x, c3.y, 8);
            }
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
     * 半圆形路径 
     * @param t 0-1
     * @param r 
     * @param a1 起始点弧度 -1.57
     * @param a2 结束点弧度 1.57
     */
    halfCircle(t, r, flag) {
        let curAngle = Math.PI * t;
        let x, y;
        if (flag) {
            x = r * Math.cos(curAngle);
            y = r * Math.sin(curAngle);
        } else {
            x = r * Math.sin(curAngle);
            y = r * Math.cos(curAngle);
        }

        return cc.v2(x, y);
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
