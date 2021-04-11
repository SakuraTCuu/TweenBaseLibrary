const { ccclass, property } = cc._decorator;

/**
 * 基础Node
 * 扩展其他属性
 */
@ccclass
export default class BaseNode extends cc.Component {

    private _type;/**type类型，用于标识是何种类型 */
    public get type() {
        return this._type;
    }
    public set type(value) {
        this._type = value;
    }

    onLoad() {

    }

}
