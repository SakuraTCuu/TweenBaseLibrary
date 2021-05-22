import Helloworld from "./Helloworld";
import TweenParseManager from "./TweenParseManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestAction extends cc.Component {

    onLoad() {
        this.node.on('touchstart',()=>{
            const component = cc.find('Canvas').getComponent(Helloworld);
            const tween = TweenParseManager.getTweenByData1(component.parseExportData(), this);
            if( tween instanceof cc.Tween){
                tween
                    .target(this.node)
                    .start();
            }   
        });
    }

    protected action0() {
        console.log(`action0${Date.now() % 10000}`);
    }

    protected action1() {
        console.log(`action0${Date.now() % 10000}`);
    }

    protected action2() {
        console.log(`action0${Date.now() % 10000}`);
    }
}
