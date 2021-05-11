/**缓动类型 */
export enum EasingType {
    NULL,
    /**
    !#zh 平方曲线缓入函数。运动由慢到快。
    */
    QUADIN,
    /**
    !#zh 平方曲线缓出函数。运动由快到慢。
    */
    QUADOUT,
    /**
    !#zh 平方曲线缓入缓出函数。运动由慢到快再到慢。
    */
    QUADINOUT,
    /**
    !#zh 立方曲线缓入函数。运动由慢到快。
    */
    CUBICIN,
    /**
    !#zh 立方曲线缓出函数。运动由快到慢。
    */
    CUBICOUT,
    /**
    !#zh 立方曲线缓入缓出函数。运动由慢到快再到慢。
    */
    CUBICINOUT,
    /**
    !#zh 四次方曲线缓入函数。运动由慢到快。
    */
    QUARTIN,
    /**
    !#zh 四次方曲线缓出函数。运动由快到慢。
    */
    QUARTOUT,
    /**
    !#zh 四次方曲线缓入缓出函数。运动由慢到快再到慢。
    */
    QUARTINOUT,
    /**
    !#zh 五次方曲线缓入函数。运动由慢到快。
    */
    QUINTIN,
    /**
    !#zh 五次方曲线缓出函数。运动由快到慢。
    */
    QUINTOUT,
    /**
    !#zh 五次方曲线缓入缓出函数。运动由慢到快再到慢。
    */
    QUINTINOUT,
    /**
    !#zh 正弦曲线缓入函数。运动由慢到快。
    */
    SINEIN,
    /**
    !#zh 正弦曲线缓出函数。运动由快到慢。
    */
    SINEOUT,
    /**
    !#zh 正弦曲线缓入缓出函数。运动由慢到快再到慢。
    */
    SINEINOUT,
    /**
    !#zh 指数曲线缓入函数。运动由慢到快。
    */
    EXPOIN,
    /**
    !#zh 指数曲线缓出函数。运动由快到慢。
    */
    EXPOOUT,
    /**
    !#zh 指数曲线缓入和缓出函数。运动由慢到很快再到慢。
    */
    EXPOINOUT,
    /**
    !#zh 循环公式缓入函数。运动由慢到快。
    */
    CIRCIN,
    /**
    !#zh 循环公式缓出函数。运动由快到慢。
    */
    CIRCOUT,
    /**
    !#zh 指数曲线缓入缓出函数。运动由慢到很快再到慢。
    */
    CIRCINOUT,
    /**
    !#zh 弹簧回震效果的缓入函数。
    */
    ELASTICIN,
    /**
    !#zh 弹簧回震效果的缓出函数。
    */
    ELASTICOUT,
    /**
    !#zh 弹簧回震效果的缓入缓出函数。
    */
    ELASTICINOUT,
    /**
    !#zh 回退效果的缓入函数。
    */
    BACKIN,
    /**
    !#zh 回退效果的缓出函数。
    */
    BACKOUT,
    /**
    !#zh 回退效果的缓入缓出函数。
    */
    BACKINOUT,
    /**
    !#zh 弹跳效果的缓入函数。
    */
    BOUNCEIN,
    /**
    !#zh 弹跳效果的缓出函数。
    */
    BOUNCEOUT,
    /**
    !#zh 弹跳效果的缓入缓出函数。
    */
    BOUNCEINOUT,
    /**
    !#zh 平滑效果函数。
    */
    SMOOTH,
    /**
    !#zh 渐褪效果函数。
    */
    FADE,
}

export enum TweenFlag {
    TO,
    BY,
}

/**动画类型 */
export enum TweenType {
    COLOR,
    NORMAL,
    POSITION,
    ALPHA,
    SCALE,
    START,
    ANGLE,
    CALL,
    PARALLEL,
    SEQUENCE,
    DELAY,
    REPEAT,
    REPEATFOREVER,
    // ...
}

export const TypeColor = {
    position: '#A1D87C',
    scale: '#54ba3b',
    alpha: '#00753e',
    angle: '#009276',
    color: '#cfb491',
    start: '#fddf70'
}

/**引脚线条类型 */
export enum LineType {

}