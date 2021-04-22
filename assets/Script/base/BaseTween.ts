import BaseNode from "./BaseNode";
import { EasingType, TweenFlag, TweenType } from "./Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseTween extends BaseNode {

    protected _easingType: EasingType = EasingType.NULL;/**缓动类型 */
    public get easingType() {
        return this._easingType;
    }
    public set easingType(value) {
        this._easingType = value;
    }

    protected _tweenFlag: TweenFlag = TweenFlag.BY; /** tween 标志 */
    public get tweenFlag(): TweenFlag {
        return this._tweenFlag;
    }
    public set tweenFlag(value: TweenFlag) {
        this._tweenFlag = value;
    }

    protected _uuid: string = Date.now() + "";//随机生成uuid 作为唯一标识 TODO Temp
    private _time: number = 0;
    protected get time(): number {
        return this._time;
    }
    protected set time(value: number) {
        this._time = value;
    }

    onLoad() {

    }

    returnData(){
        
    }

}

