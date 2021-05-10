import { TweenType } from "./base/Config";

const { ccclass, property } = cc._decorator;

interface actionBean {
    data: dataBean,
    easingType: number
    tweenFlag: number
    tweenType: number
}

interface dataBean {
    time: number;
    position: cc.Vec2;
    angle: number;
    //...
}


@ccclass
export default class TweenParseManager {

    private static _data: any;
    public static get data(): any {
        return TweenParseManager._data;
    }
    public static set data(value: any) {
        TweenParseManager._data = value;
    }

    // constructor(data) {
    //     TweenParseManager.data = data;
    // }

    /**
     * [{
    "tweenType": 8,
    "data": [{
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 2,
        "data": {
            "time": 1,
            "position": {
                "x": 50,
                "y": 0
            }
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 3,
        "data": {
            "time": 1,
            "alpha": 0.2
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 6,
        "data": {
            "time": 1,
            "angle": 360
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 0,
        "data": {
            "time": 1,
            "color": "#ff0000"
        }
    }]
}, {
    "tweenType": 8,
    "data": [{
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 2,
        "data": {
            "time": 1,
            "position": {
                "x": 50,
                "y": 0
            }
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 3,
        "data": {
            "time": 1,
            "alpha": 0.2
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 0,
        "data": {
            "time": 1,
            "color": "#ff0000"
        }
    }, {
        "easingType": 0,
        "tweenFlag": 1,
        "tweenType": 6,
        "data": {
            "time": 1,
            "angle": 360
        }
    }]
}]
     */

    /**解析data */
    public static getTweenByData(node, data?) {
        data = data || this.data;

        let baseTween = cc.tween();
        for (let i = 0; i < data.length; i++) {
            const tweenInfo = data[i];
            let type = tweenInfo.tweenType;
            let actionList: Array<actionBean> = tweenInfo.data;
            if (type === TweenType.PARALLEL) {
                for (let i = 0; i < actionList.length; i++) {
                    const action = actionList[i];
                    let tween = this.getOnceAction(action);
                    /**解析actionBean */
                    baseTween.then(tween);
                }
            }
        }
    }

    private static getOnceAction(data: actionBean): cc.Tween {
        // return new cc.Tween().by(data.time);
        return new cc.Tween();
    }

}
