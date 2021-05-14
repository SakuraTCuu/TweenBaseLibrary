import { EasingType, TweenFlag, TweenType } from "./base/Config";

const { ccclass, property } = cc._decorator;

interface actionBean {
    data: dataBean;
    easingType: string;
    tweenFlag: number;
    tweenType: number;
    time: number;
}

interface dataBean {
    position: cc.Vec2;
    angle: number;
}


@ccclass
export default class TweenParseManager {

    private static _data: any;
    // public static get data(): any {
    //     return TweenParseManager._data;
    // }
    // public static set data(value: any) {
    //     TweenParseManager._data = value;
    // }

    /**解析data */
    public static getTweenByData(data) {
        // data = data || this.data;
        if (!data || data.length <= 0) {
            return cc.error("Invalid data");
        }

        // cc.log(data);
        let baseTween = cc.tween();
        for (let i = 0; i < data.length; i++) {
            const tweenInfo = data[i];
            let type = tweenInfo.tweenType;
            let actionList: Array<actionBean> = tweenInfo.data;
            let repeatTime = tweenInfo.repeatTime;
            if (type === TweenType.PARALLEL) {
                let resultTween = [];
                for (let i = 0; i < actionList.length; i++) {
                    const action = actionList[i];
                    /**解析actionBean */
                    let tween = this.getOnceAction(action);
                    resultTween.push(tween);
                }
                if (resultTween.length >= 2) {
                    // @ts-ignore
                    baseTween = baseTween.parallel(...resultTween);
                } else {
                    baseTween = baseTween.then(resultTween[0])
                }
                baseTween.repeat(repeatTime);
            }
        }
        return baseTween;
    }

    /** {easingType: 0, tweenFlag: 1, tweenType: 4, time: 1, data: {…}} */
    private static getOnceAction(action: actionBean): cc.Tween {
        let tween = new cc.Tween();
        let easing = this.getEasingByType(action.easingType);
        if (action.tweenFlag === TweenFlag.BY) {
            tween.by(action.time, action.data, { easing });
        } else {
            tween.to(action.time, action.data, { easing });
        }
        return tween;
    }

    private static getEasingByType(easingType) {
        switch (easingType) {
            case EasingType.NULL: return '';
            case EasingType.QUADIN: return 'quadIn';
            case EasingType.QUADOUT: return 'quadOut';
            case EasingType.QUADINOUT: return 'quadInOut';
            case EasingType.CUBICIN: return 'cubicIn';
            case EasingType.CUBICOUT: return 'cubicOut';
            case EasingType.CUBICINOUT: return 'cubicInOut';
            case EasingType.QUARTIN: return 'quartIn';
            case EasingType.QUARTOUT: return 'quartOut';
            case EasingType.QUARTINOUT: return 'quartInOut';
            case EasingType.QUINTIN: return 'quintIn';
            case EasingType.QUINTOUT: return 'quintOut';
            case EasingType.QUINTINOUT: return 'quintInOut';
            case EasingType.SINEIN: return 'sineIn';
            case EasingType.SINEOUT: return 'sineOut';
            case EasingType.SINEINOUT: return 'sineInOut';
            case EasingType.EXPOIN: return 'expoIn';
            case EasingType.EXPOOUT: return 'expoOut';
            case EasingType.EXPOINOUT: return 'expoInOut';
            case EasingType.CIRCIN: return 'circIn';
            case EasingType.CIRCOUT: return 'circOut';
            case EasingType.CIRCINOUT: return 'circInOut';
            case EasingType.ELASTICIN: return 'elasticIn';
            case EasingType.ELASTICOUT: return 'elasticOut';
            case EasingType.ELASTICINOUT: return 'elasticInOut';
            case EasingType.BACKIN: return 'backIn';
            case EasingType.BACKOUT: return 'backOut';
            case EasingType.BACKINOUT: return 'backInOut';
            case EasingType.BOUNCEIN: return 'bounceIn';
            case EasingType.BOUNCEOUT: return 'bounceOut';
            case EasingType.BOUNCEINOUT: return 'bounceInOut';
            case EasingType.SMOOTH: return 'smooth';
            case EasingType.FADE: return 'fade';
        }
        return '';
    }
}
