/**
 * TODO 
 *  需要处理多个相同的音效调用, 应该不中断当前,而是不播放传入的
 */
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
            // cc.log("语音正在播放,安静排队ing...");
            /**中断播放,有回调播回调 */
            thread.stop();
            return;
        }
        thread.play();
    }

    /**不会有同源音频播放 */

    /**中断操作 */
    public static stopVoice(audioId: number) {
        if (typeof audioId === undefined || typeof audioId === null) {
            return;
        }
        /** 背景音/特效音 */
        let thread = this.ThreadData[audioId];
        if (thread && thread.isPlaying) {
            thread.stop();
        }

        /** 语音 */
        this.playList.forEach(item => {
            if (item.audioId === audioId) {
                item.stop();
            }
        });
    }

    /**
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
        /**尝试播放 */
        this.execLogic();
        return thread.audioId;
    }

    /**播放特效*/
    public static playSFX(audio, volume?, isLoop?) {
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
    private _audioId: number = 0;
    public get audioId(): number {
        return this._audioId;
    }
    public set audioId(value: number) {
        this._audioId = value;
    }
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

