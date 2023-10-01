import { Readable } from "stream"
import { endianness } from "os"

import { AudioInput, AudioInputArgs } from "../AudioInput/AudioInput"
import { AudioSampleRate, AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

import mixAudioChunks from "../Utils/mixAudioChunks"
import changeVolume from "../Utils/ChangeVolume"


type delayTimeType = number | (() => number);

interface AudioMixerArgs {
    sampleRate?: AudioSampleRate
    channels?: number
    volume?: number
    bitDepth?: AudioBitDepth
    endianness?: AudioEndianness
    highWaterMark?: number | null
    delayTime?: delayTimeType
    autoClose?: boolean
}


class AudioMixer extends Readable {
    private sampleRate: AudioSampleRate;
    private channels: number;
    private volume: number;
    private bitDepth: AudioBitDepth;
    private endianness: AudioEndianness;
    private highWaterMark: number | null;
    private delayTime: delayTimeType;
    private autoClose: boolean;

    private inputs: Array<AudioInput> = [];

    private mixerClosed: boolean = false;

    constructor(args?: AudioMixerArgs) {
        super();

        this.sampleRate = args.sampleRate ?? 48000;
        this.channels = args.channels ?? 1;
        this.volume = args.volume ?? 100;
        this.bitDepth = args.bitDepth ?? 16;
        this.endianness = args.endianness ?? endianness();
        this.highWaterMark = args.highWaterMark ?? null;
        this.delayTime = args.delayTime ?? 1;
        this.autoClose = args.autoClose ?? false;

        this.loopRead();

        this.once("close", this.close);
    }


    public _read(): void {
        if (this.inputs.length === 0) return;

        const chunks: Array<Buffer> = [];

        this.inputs.forEach(async (i) => { if (i.availableAudioLength > 0) chunks.push(i.readAudioChunk(this.highWaterMark)); });

        if (chunks.length === 0) return;

        const mixerArgs: AudioMixerArgs = {
            sampleRate: this.sampleRate,
            channels: this.channels,
            volume: this.volume,
            bitDepth: this.bitDepth,
            endianness: this.endianness,
            highWaterMark: this.highWaterMark
        }

        const changeVolumeArgs = {
            volume: this.volume,
            bitDepth: this.bitDepth,
            endianness: this.endianness
        }

        const mixedChunkSize = this.highWaterMark ?? Math.min(...chunks.map(chunk => chunk.length));
        let mixedChunk: Buffer = mixAudioChunks(chunks, mixedChunkSize, mixerArgs);

        this.unshift(changeVolume(mixedChunk, changeVolumeArgs));
    }

    public setVolume(volume: number): this {
        this.volume = volume;

        return this;
    }

    public createAudioInput(inputArgs: AudioInputArgs): AudioInput {
        const mixerArgs: AudioMixerArgs = {
            sampleRate: this.sampleRate,
            channels: this.channels,
            bitDepth: this.bitDepth,
            endianness: this.endianness,
        }

        const audioInput = new AudioInput(inputArgs, mixerArgs, this.removeAudioInput.bind(this));

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

        if (this.inputs.length === 0 && this.autoClose) return this.close();

        return this;
    }

    public close(): this {
        if (this.mixerClosed && this.inputs.length === 0) return this;

        this.inputs.forEach(input => input.close());

        this.destroy();
        this.unshift(null);

        this.mixerClosed = true;

        return this;
    }

    private loopRead(): void {
        if (this.mixerClosed) return;

        this._read();

        const delayTime = typeof this.delayTime === "number" ? this.delayTime : this.delayTime();

        setTimeout(this.loopRead.bind(this), delayTime);
    }
}

export { AudioMixer, AudioMixerArgs };