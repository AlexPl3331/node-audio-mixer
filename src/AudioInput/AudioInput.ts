import { Writable } from "stream"
import { endianness } from "os"

import { AudioMixerArgs } from "../AudioMixer/AudioMixer"
import { AudioSampleRate, AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

import changeVolume from "../Utils/ChangeVolume"
import changeSampleOptions from "../Utils/ChangeSampleOptions"
import generateSilentChunk from "../Utils/GenerateSilentChunk"


type SelfRemoveFunction = (audioInput: AudioInput) => void;

interface AudioInputArgs {
    sampleRate?: AudioSampleRate,
    channels?: number,
    volume?: number,
    bitDepth?: AudioBitDepth,
    endianness?: AudioEndianness,
    fillChunk?: boolean,
    forceClose?: boolean
}


class AudioInput extends Writable {
    private inputOptions: AudioInputArgs = {
        sampleRate: 48000,
        channels: 1,
        volume: 100,
        bitDepth: 16,
        endianness: endianness(),
        fillChunk: false,
        forceClose: false
    }

    private mixerArgs: AudioMixerArgs = {
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
        this.mixerArgs = Object.assign(this.mixerArgs, mixerArgs);

        this.removeSelf = removeFunction ?? null;

        this.once("close", () => {
            this.inputClosed = true;

            if (this.audioBuffer.length === 0 || this.inputOptions.forceClose) 
            {
                this.audioBuffer = Buffer.alloc(0);
                if (this.removeSelf) this.removeSelf(this);
            }
            else
                if (this.removeSelf) this.removeInterval = setInterval(this.autoRemoveFunc.bind(this), 1);
        });
    }


    public _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error) => void): void {
        if (this.inputClosed) return;

        const processedChunk = changeSampleOptions(chunk, this.inputOptions, this.mixerArgs);

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

        if (this.audioBuffer.length === 0 || this.inputOptions.forceClose) 
        {
            this.audioBuffer = Buffer.alloc(0);
            if (this.removeSelf) this.removeSelf(this);
        }
        else
            if (this.removeSelf) this.removeInterval = setInterval(this.autoRemoveFunc.bind(this), 1);

        this.end();
    }

    public readAudioChunk(highWaterMark: number | null): Buffer {
        if (this.audioBuffer.length === 0) return this.audioBuffer;

        let chunk: Buffer = this.audioBuffer.subarray(0, highWaterMark ?? this.audioBuffer.length);
        this.audioBuffer = !highWaterMark ? Buffer.alloc(0) : this.audioBuffer.subarray(highWaterMark, this.audioBuffer.length);

        if (typeof highWaterMark === "number")
        {
            if (chunk.length < highWaterMark)
            {
                if (!this.inputOptions.fillChunk) return Buffer.alloc(0);

                const silentChunk = generateSilentChunk(this.mixerArgs.sampleRate, this.mixerArgs.channels, highWaterMark - chunk.length);
                chunk = Buffer.concat([chunk, silentChunk]);
            }
        }

        const changeVolumeArgs = {
            volume: this.inputOptions.volume,
            bitDepth: this.mixerArgs.bitDepth,
            endianness: this.mixerArgs.endianness
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