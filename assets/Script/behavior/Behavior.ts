const { ccclass, property } = cc._decorator;

/**
 * 尝试使用行为树来实现
 */
@ccclass
export default class Behavior extends cc.Component {


    onLoad() {

    }

    start() {

    }

    enter(tick, b3, treeNode) {
        console.log("enter");
    }

    link() {
        console.log("link");
    }

    open(tick, b3, treeNode) {
        console.log("open");
    }

    tick(tick, b3, treeNode) {
        console.log("tick");
        /**检测 */
    }

    close(tick, b3, treeNode) {
        console.log("close");
    }

    exit(tick, b3, treeNode) {
        console.log("exit");
    }
    // update (dt) {}
}
