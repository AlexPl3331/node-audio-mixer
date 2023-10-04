import { Writable } from "stream"
import { endianness } from "os"

import { AudioMixerArgs } from "../AudioMixer/AudioMixer"
import { AudioSampleRate, AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

import changeVolume from "../Utils/ChangeVolume"
import changeSampleOptions from "../Utils/ChangeSampleOptions"


type SelfRemoveFunction = (audioInput: AudioInput) => void;

interface AudioInputArgs {
    sampleRate?: AudioSampleRate,
    channels?: number,
    volume?: number,
    bitDepth?: AudioBitDepth,
    endianness?: AudioEndianness,
    forceClose?: boolean
}


class AudioInput extends Writable {
    private inputOptions: AudioInputArgs = {
        sampleRate: 48000,
        channels: 1,
        volume: 100,
        bitDepth: 16,
        endianness: endianness(),
        forceClose: false
    }

    private audioMixerArgs: AudioMixerArgs = {
        sampleRate: 48000,
        channels: 1,
        volume: 100,
        bitDepth: 16,
        endianness: endianness(),
        highWaterMark: null,
        delayTime: 1,
        autoClose: false
    };

    private audioBuffer: Buffer = Buffer.alloc(0);
    private inputClosed: boolean = false;

    private removeInterval: NodeJS.Timeout;
    private removeSelf: (audioInput: AudioInput) => void;


    constructor(inputArgs: AudioInputArgs, mixerArgs: AudioMixerArgs, removeFunction?: SelfRemoveFunction) {
        super();

        this.inputOptions = Object.assign(this.inputOptions, inputArgs);
        this.audioMixerArgs = Object.assign(this.audioMixerArgs, mixerArgs);

        this.removeSelf = removeFunction ?? null;

        this.once("close", () => {
            this.inputClosed = true;

            if (this.audioBuffer.length > 0 && !this.inputOptions.forceClose) 
            {
                this.removeInterval = setInterval(this.autoRemoveFunc.bind(this), 1);
                return;
            }

            this.audioBuffer = Buffer.alloc(0);

            if (this.removeSelf) this.removeSelf(this);
        });
    }


    public _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error) => void): void {
        if (this.inputClosed) return;

        const processedChunk = changeSampleOptions(chunk, this.inputOptions, this.audioMixerArgs);

        this.audioBuffer = Buffer.concat([this.audioBuffer, processedChunk]);
        callback();
    }

    public get getOptions(): AudioInputArgs {
        return { ...this.inputOptions };
    }

    public setVolume(volume: number): this {
        this.inputOptions.volume = volume;

        return this;
    }

    public setForceClose(forceClose: boolean): this {
        this.inputOptions.forceClose = forceClose;

        return this;
    }

    public close(): void {
        this.inputClosed = true;

        if (this.audioBuffer.length > 0 && !this.inputOptions.forceClose) 
        {
            this.end();

            this.removeInterval = setInterval(this.autoRemoveFunc.bind(this), 1);
            return;
        };

        this.audioBuffer = Buffer.alloc(0);

        if (this.removeSelf) this.removeSelf(this);

        this.end();
    }

    public readAudioChunk(highWaterMark?: number): Buffer {
        if (this.audioBuffer.length === 0) return this.audioBuffer;

        let chunk: Buffer = !highWaterMark ? Buffer.from(this.audioBuffer) : this.audioBuffer.subarray(0, highWaterMark); 1
        this.audioBuffer = !highWaterMark ? Buffer.alloc(0) : this.audioBuffer.subarray(highWaterMark, this.audioBuffer.length);

        if (this.audioBuffer.length < highWaterMark) 
        {
            const bytesPerSample = this.audioMixerArgs.bitDepth / 8;

            const silentChunkLength = (highWaterMark - chunk.length) * bytesPerSample;
            const silentChunk = Buffer.alloc(silentChunkLength);

            chunk = Buffer.concat([chunk, silentChunk]);
        }

        const changeVolumeArgs = {
            volume: this.inputOptions.volume,
            bitDepth: this.audioMixerArgs.bitDepth,
            endianness: this.audioMixerArgs.endianness
        }

        return changeVolume(chunk, changeVolumeArgs);
    }

    private autoRemoveFunc(): void {
        if (this.audioBuffer.length > 0) return;

        clearInterval(this.removeInterval);
        return this.removeSelf(this);
    }
}

export { AudioInput, AudioInputArgs };