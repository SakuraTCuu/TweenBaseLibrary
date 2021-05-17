/** 
 * 动画:
 *      动画的解析
 * 语音:
 *     延迟
 *     配合动作
 *     中断
 * 龙骨:
 *    骨骼动画名
 *
 *  act_name: '',
 *  cb: '',
 */
const TWEEN = 1;
const ADUIO = 2;
const DRAGON = 4;
let data = {
    type: TWEEN | ADUIO,
    main: [
        {
            tween: 1,
            audio: 1,
        },
        {
            tween: 2,
            audio: 1,
        },
        {
            audio: 1,
            dragon: 2
        },
    ],
    tween: [ /**动作数据 */
        {
            repeatTime: 1, /**重复次数 */
            data: [
                {
                    audio: 0, /**语音下标 */
                    easingType: 0, /**缓动类型 */
                    time: 1,  /**时间 */
                    tweenFlag: 1, /** to/by */
                    data: {
                        position: {}
                    },
                    hook_cb: '', /**回调事件 */
                }
            ],
        }
    ],
    audio: [ /**声音数据 */
        {
            id: 1,
            url: '',            /**资源地址 */
            delay: 0.5,         /**延迟播放 */
            hook_cb: '' /**播放事件回调 */
        }
    ],
    dragon: [ /**龙骨数据 */
        {
            id: 1, /**直接执行 动作, 不加载龙骨 */
            act_name: '', /**龙骨动画名 */
            repeatTime: 1, /**执行次数 */
            hook_cb: '', /**回调事件 */
        }
    ]
}