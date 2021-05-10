// export default class AudioManager {

//     private static _isPlaying = false;
//     private static _currentCall = null;
//     private static _currentAudioId = null;
//     private static playList: Array<cc.AudioClip> = new Array();

//     execLogic() {
//         let thread = this.playList[0];
//         if (thread.isPlaying) {
//             return;
//         }
//         // thread.play();
//     }
//     /**
//      * 播放 题目/对话/结束/引导/... 语音
//      * @param audio 
//      * @param cb 
//      * @param isCover 如果有新音频播放,当前音频是否被覆盖  默认 true
//      * @param isLoop  是否循环  默认 false
//      * @param volume  音量大小  默认 1
//      * @returns 
//      */
//     public static playVoice(audio: cc.AudioClip, cb?) {
//         if (!audio) {
//             return cb && cb();
//         }
//         if (!(audio instanceof cc.AudioClip)) {
//             // audio = cc.aha.Resource.voice(residOrAudioClip);
//             if (!audio) {
//                 return cc.log("wrong type!")
//             }
//         }

//         if (this._isPlaying) {
//             this._currentCall && this._currentCall();
//             this.stopAudio(this._currentAudioId);
//         }

//         this._isPlaying = true;

//         let callback = () => {
//             this._isPlaying = false;
//             cb && cb();
//         }

//         let audioId = this.playAudio(audio, callback);

//         this._currentCall = callback;
//         this._currentAudioId = audioId;
//     }

//     private static stopAudio(audioId) {
//         cc.audioEngine.stop(audioId);
//     }

//     private static playAudio(audio, cb?, isLoop?, volume?) {
//         volume = volume || 1;
//         let audioId = cc.audioEngine.play(audio, isLoop, volume);
//         cc.audioEngine.setFinishCallback(audioId, cb);
//         return audioId;
//     }

//     /**播放特效*/
//     public static playSFX(audio, volume) {
//         this.playAudio(audio, null, false, volume);
//     }

//     /**播放背景音乐 */
//     public static playBGM(audio, volume) {
//         this.playAudio(audio, null, true, volume);
//     }
// }

export default class AudioMgr {

    static ThreadData = {};
    static playList: Array<Thread> = new Array();

    public static update(audioId) {
        this.playList.splice(0, 1);
        this.execLogic();
    }

    static execLogic() {
        let thread = this.playList[0];
        if (!thread) {
            cc.log("休眠ing...");
            return;
        }
        if (thread.isPlaying) {
            cc.log("语音正在播放,安静排队ing...");
            return;
        }
        thread.play();
    }

    /**不会有同源音频播放 */

    /**中断操作 */
    public static stopVoice(audioId) {
        let thread = this.ThreadData[audioId];
        if (thread && thread.isPlaying) {
            thread.stop();
        }
    }

    /**
     * 
     * 排队? 插队? 覆盖
     * 
     * 播放 题目/对话/结束/引导/... 语音
     * @param audio 
     * @param cb 
     * @param isCover 如果有新音频播放,当前音频是否被覆盖  默认 true
     * @param isLoop  是否循环  默认 false
     * @param volume  音量大小  默认 1
     * @returns 
     */
    public static playVoice(audio: cc.AudioClip, cb?) {
        if (!audio) {
            return cb && cb();
        }
        if (!(audio instanceof cc.AudioClip)) {
            // audio = cc.aha.Resource.voice(residOrAudioClip);
            if (!audio) {
                return cc.log("wrong type!");
            }
        }

        let thread = new Thread(audio, (audioId) => {
            cb && cb();
            this.update(audioId);
        });
        this.playList.push(thread);
        this.execLogic();
    }

    /**播放特效*/
    public static playSFX(audio, volume?, isLoop?) {
        // isL
        let thread = new Thread(audio, this.update, false, volume);
        let audioId = thread.play();
        this.ThreadData[audioId] = thread;
    }

    /**播放背景音乐 */
    public static playBGM(audio, volume) {
        let thread = new Thread(audio, this.update, true, volume);
        let audioId = thread.play();
        this.ThreadData[audioId] = thread;
    }
}

class Thread {
    _audioId: number = 0;
    _audio: cc.AudioClip = null;
    _cb: Function = null;
    _isBGM: boolean = false;
    _isLoop: boolean = false;
    _volume: number = 1;
    private _isPlaying: boolean = false;
    public get isPlaying(): boolean {
        return this._isPlaying;
    }
    public set isPlaying(value: boolean) {
        this._isPlaying = value;
    }

    constructor(audio, cb, isLoop?, volume?) {
        this._audio = audio;
        this.setCallback(cb);
        this._isLoop = isLoop;
        this._volume = volume || 1;
    }

    public setCallback(cb) {
        this._cb = () => {
            cc.log("end play", this._audioId);
            this.isPlaying = false;
            cb && cb(this._audioId);
        };
    }
    public play() {
        this._audioId = cc.audioEngine.play(this._audio, this._isLoop, this._volume);
        cc.audioEngine.setFinishCallback(this._audioId, this._cb);
        this.isPlaying = true;
        cc.log("start play", this._audioId);
        return this._audioId;
    }
    public stop() {
        if (this.isPlaying) {
            cc.log("stop play", this._audioId);
            this._cb && this._cb(this._audioId);
            cc.audioEngine.stop(this._audioId);
        }
    }

    public destroy() {

    }
}

