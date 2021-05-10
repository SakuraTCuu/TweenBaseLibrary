const { ccclass, property } = cc._decorator;

@ccclass
export default class TweenList extends cc.Component {

    @property(cc.Node)
    Position: cc.Node = null;

    @property(cc.Node)
    Scale: cc.Node = null;

    @property(cc.Node)
    Angle: cc.Node = null;

    @property(cc.Node)
    Color: cc.Node = null;

    @property(cc.Node)
    Alpha: cc.Node = null;

    @property(cc.Node)
    Repeat: cc.Node = null;

    @property(cc.Prefab)
    PositionPre: cc.Prefab = null;
    @property(cc.Prefab)
    ScalePre: cc.Prefab = null;
    @property(cc.Prefab)
    AnglePre: cc.Prefab = null;
    @property(cc.Prefab)
    ColorPre: cc.Prefab = null;
    @property(cc.Prefab)
    AlphaPre: cc.Prefab = null;
    @property(cc.Prefab)
    RepeatPre: cc.Prefab = null;

    onShowTweenItem(type) {
        switch (type) {
            case 'position':
                this.Position.active = true;
                break;
            case 'scale':
                this.Scale.active = true;
                break;
            case 'opacity':
                this.Alpha.active = true;
                break;
            case 'angle':
                this.Angle.active = true;
                break;
            case 'color':
                this.Color.active = true;
                break;
            case 'repeat':
                this.Repeat.active = true;
                break;
        }
    }

    onClickTweenItem(event, type) {
        let prefab;
        switch (type) {
            case 'position':
                prefab = this.PositionPre;
                this.Position.active = false;
                break;
            case 'scale':
                prefab = this.ScalePre;
                this.Scale.active = false;
                break;
            case 'alpha':
                prefab = this.AlphaPre;
                this.Alpha.active = false;
                break;
            case 'angle':
                prefab = this.AnglePre;
                this.Angle.active = false;
                break;
            case 'color':
                prefab = this.ColorPre;
                this.Color.active = false;
                break;
            case 'repeat':
                prefab = this.RepeatPre;
                this.Repeat.active = false;
                break;
        }
        let result = new cc.Event.EventCustom('add', true);
        result.detail = { prefab };
        this.node.dispatchEvent(result);
        this.node.active = false;
    }

}
