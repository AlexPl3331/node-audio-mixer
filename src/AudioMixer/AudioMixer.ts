import { Readable } from "stream"
import { endianness } from "os"

import { AudioInput, AudioInputArgs } from "../AudioInput/AudioInput"
import { AudioSampleRate, AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

import generateSilentChunk from "../Utils/GenerateSilentChunk"
import mixAudioChunks from "../Utils/mixAudioChunks"
import changeVolume from "../Utils/ChangeVolume"


type delayTimeType = number | (() => number);
type preProcessDataType = (data: Buffer) => Buffer;

interface AudioMixerArgs {
    sampleRate?: AudioSampleRate
    channels?: number
    bitDepth?: AudioBitDepth
    endianness?: AudioEndianness
    volume?: number
    highWaterMark?: number | null;
    generateSilent?: boolean
    silentDuration?: number | null
    preProcessData?: preProcessDataType
    delayTime?: delayTimeType
    autoClose?: boolean
}


class AudioMixer extends Readable {
    private mixerOptions: AudioMixerArgs = {
        sampleRate: 48000,
        channels: 1,
        bitDepth: 16,
        endianness: endianness(),
        volume: 100,
        highWaterMark: null,
        generateSilent: false,
        silentDuration: null,
        preProcessData: (data: Buffer) => { return data; },
        delayTime: 1,
        autoClose: false
    };

    private inputs: Array<AudioInput> = [];

    private mixerClosed: boolean = false;
    private delayTimeValue: number;

    constructor(mixerArgs?: AudioMixerArgs) {
        super();

        this.mixerOptions = Object.assign(this.mixerOptions, mixerArgs);

        this.delayTimeValue = typeof this.mixerOptions.delayTime === "number" ? this.mixerOptions.delayTime : this.mixerOptions.delayTime();

        setTimeout(this.loopRead.bind(this), this.delayTimeValue);

        this.once("close", this.close);
    }


    public _read(): void {
        if (this.isPaused()) return;

        const chunks: Array<Buffer> = this.inputs.map((input: AudioInput) => input.readAudioChunk(this.mixerOptions.highWaterMark)).filter((chunk: Buffer) => chunk.length > 0);

        if (chunks.length === 0)
        {
            if (this.mixerOptions.generateSilent)
            {
                const silentChunk: Buffer = generateSilentChunk(this.mixerOptions.highWaterMark ?? (this.mixerOptions.sampleRate * this.mixerOptions.channels / 1000) * Math.max(1, this.mixerOptions.silentDuration ?? this.delayTimeValue));
                this.unshift(silentChunk);
            }

            return;
        }

        const changeVolumeArgs = {
            volume: this.mixerOptions.volume,
            bitDepth: this.mixerOptions.bitDepth,
            endianness: this.mixerOptions.endianness
        }

        const mixedChunkSize = this.mixerOptions.highWaterMark ?? Math.min(...chunks.map(chunk => chunk.length));
        let mixedChunk: Buffer = mixAudioChunks(chunks, mixedChunkSize, this.mixerOptions);

        this.unshift(this.mixerOptions.preProcessData(changeVolume(mixedChunk, changeVolumeArgs)));
    }

    public get getOptions(): AudioMixerArgs {
        return { ...this.mixerOptions };
    }

    public setVolume(volume: number): this {
        this.mixerOptions.volume = volume;

        return this;
    }

    public setHighWaterMark(highWaterMark: number | null): this {
        this.mixerOptions.highWaterMark = highWaterMark;

        return this;
    }

    public setgenerateSilent(generateSilent: boolean) {
        this.mixerOptions.generateSilent = generateSilent;

        return this;
    }

    public setSilentDuration(silentDuration: number | null) {
        this.mixerOptions.silentDuration = silentDuration;

        return this;
    }

    public setPreProcessData(preProcessData: preProcessDataType) {
        this.mixerOptions.preProcessData = preProcessData;

        return this;
    }

    public setDelayTime(delayTime: delayTimeType): this {
        this.mixerOptions.delayTime = delayTime;

        return this;
    }

    public setAutoClose(autoClose: boolean): this {
        this.mixerOptions.autoClose = autoClose;

        return this;
    }

    public createAudioInput(inputArgs: AudioInputArgs): AudioInput {
        const audioInput = new AudioInput(inputArgs, this.mixerOptions, this.removeAudioInput.bind(this));

        this.inputs.push(audioInput);

        this.emit("addInput");

        return audioInput;
    }

    public removeAudioInput(audioInput: AudioInput): this {
        const findAudioInput = this.inputs.indexOf(audioInput);

        if (findAudioInput !== -1)
        {
            this.inputs.splice(findAudioInput, 1);

            this.emit("removeInput");
        }

        if (this.inputs.length === 0 && this.mixerOptions.autoClose) return this.close();

        return this;
    }

    public close(): this {
        if (this.mixerClosed && this.inputs.length === 0) return this;

        this.inputs.forEach(input => input.close());

        this.destroy();
        this.unshift(null);

        this.mixerClosed = true;
        this.emit("end");

        return this;
    }

    private loopRead(): void {
        if (this.mixerClosed) return;

        this._read();

        this.delayTimeValue = typeof this.mixerOptions.delayTime === "number" ? this.mixerOptions.delayTime : this.mixerOptions.delayTime();

        setTimeout(this.loopRead.bind(this), this.delayTimeValue);
    }
}

export { AudioMixer, AudioMixerArgs };