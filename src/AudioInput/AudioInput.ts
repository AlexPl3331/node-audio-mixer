import { Writable } from "stream"
import { endianness } from "os"

import { AudioMixerArgs } from "../AudioMixer/AudioMixer"
import { AudioSampleRate, AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

import changeVolume from "../Utils/ChangeVolume"
import changeSampleOptions from "../Utils/ChangeSampleOptions"
import generateSilentChunk from "../Utils/GenerateSilentChunk"


type preProcessDataType = (data: Buffer) => Buffer;
type SelfRemoveFunction = (audioInput: AudioInput) => void;

interface AudioInputArgs {
    sampleRate?: AudioSampleRate
    channels?: number
    bitDepth?: AudioBitDepth
    endianness?: AudioEndianness
    volume?: number
    fillChunk?: boolean
    preProcessData?: preProcessDataType
    forceClose?: boolean
}


class AudioInput extends Writable {
    private inputOptions: AudioInputArgs = {
        sampleRate: 48000,
        channels: 1,
        bitDepth: 16,
        endianness: endianness(),
        volume: 100,
        fillChunk: false,
        preProcessData: (data: Buffer) => { return data; },
        forceClose: false
    }

    private mixerOptions: AudioMixerArgs = {
        sampleRate: 48000,
        channels: 1,
        bitDepth: 16,
        endianness: endianness(),
        volume: 100,
        highWaterMark: null,
        delayTime: 1,
        generateSilent: false,
        silentDuration: null,
        preProcessData: (data: Buffer) => { return data; },
        autoClose: false
    };

    private audioBuffer: Buffer = Buffer.alloc(0);
    private isInputClosed: boolean = false;

    private removeInterval: NodeJS.Timeout;
    private removeSelf: (audioInput: AudioInput) => void;


    constructor(inputArgs: AudioInputArgs, mixerArgs: AudioMixerArgs, removeFunction?: SelfRemoveFunction) {
        super();

        this.inputOptions = Object.assign(this.inputOptions, inputArgs);
        this.mixerOptions = Object.assign(this.mixerOptions, mixerArgs);

        this.removeSelf = removeFunction ?? null;

        this.once("close", this.close);
    }


    public _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error) => void): void {
        if (this.isInputClosed) return;

        const processedChunk = changeSampleOptions(this.inputOptions.preProcessData(chunk), this.inputOptions, this.mixerOptions);

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

    public setPreProcessData(preProcessData: preProcessDataType) {
        this.inputOptions.preProcessData = preProcessData;

        return this;
    }

    public setForceClose(forceClose: boolean): this {
        this.inputOptions.forceClose = forceClose;

        return this;
    }

    public close(): void {
        if (this.isInputClosed) return;

        this.isInputClosed = true;

        if (this.audioBuffer.length === 0 || this.inputOptions.forceClose) 
        {
            this.audioBuffer = Buffer.alloc(0);
            if (this.removeSelf) this.removeSelf(this);
        }
        else
            if (this.removeSelf) this.removeInterval = setInterval(this.autoRemoveFunc.bind(this), 1);

        this.end();
    }

    public readAudioChunk(highWaterMark: number): Buffer {
        let chunk: Buffer = this.audioBuffer.subarray(0, highWaterMark);
        this.audioBuffer = this.audioBuffer.subarray(highWaterMark, this.audioBuffer.length);

        if (typeof highWaterMark === "number")
        {
            if (chunk.length < highWaterMark)
            {
                if (!this.inputOptions.fillChunk) return Buffer.alloc(0);

                const silentChunk = generateSilentChunk(highWaterMark - chunk.length);
                chunk = Buffer.concat([chunk, silentChunk]);
            }
        }

        const changeVolumeArgs = {
            volume: this.inputOptions.volume,
            bitDepth: this.mixerOptions.bitDepth,
            endianness: this.mixerOptions.endianness
        }

        return changeVolume(chunk, changeVolumeArgs);
    }

    public get availableAudioLength() {
        return this.audioBuffer.length;
    }

    private autoRemoveFunc(): void {
        if (this.audioBuffer.length > 0) return;

        clearInterval(this.removeInterval);
        return this.removeSelf(this);
    }
}

export { AudioInput, AudioInputArgs };