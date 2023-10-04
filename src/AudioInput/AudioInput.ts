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
    private sampleRate: AudioSampleRate;
    private channels: number;
    private volume: number;
    private bitDepth: AudioBitDepth;
    private endianness: AudioEndianness;
    private forceClose: boolean;

    private audioMixerArgs: AudioMixerArgs;
    private removeInterval: NodeJS.Timeout;
    private removeSelf: (audioInput: AudioInput) => void;

    private audioBuffer: Buffer = Buffer.alloc(0);

    private inputClosed: boolean = false;

    constructor(args: AudioInputArgs, mixerArgs: AudioMixerArgs, removeFunction?: SelfRemoveFunction) {
        super();

        const defaultAudioMixerArgs: AudioMixerArgs = {
            sampleRate: 48000,
            channels: 1,
            bitDepth: 16,
            endianness: endianness()
        };

        this.sampleRate = args.sampleRate ?? 48000;
        this.channels = args.channels ?? 1;
        this.volume = args.volume ?? 100;
        this.bitDepth = args.bitDepth ?? 16;
        this.endianness = args.endianness ?? endianness();
        this.forceClose = args.forceClose ?? false;

        this.audioMixerArgs = mixerArgs || defaultAudioMixerArgs;

        this.removeSelf = removeFunction || null;

        this.once("close", () => {
            this.inputClosed = true;

            if (this.audioBuffer.length > 0 && !this.forceClose) 
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

        const inputParams: AudioInputArgs = {
            sampleRate: this.sampleRate,
            channels: this.channels,
            bitDepth: this.bitDepth,
            endianness: this.endianness
        }

        const processedChunk = changeSampleOptions(chunk, inputParams, this.audioMixerArgs);

        this.audioBuffer = Buffer.concat([this.audioBuffer, processedChunk]);

        callback();
    }

    public setVolume(volume: number): this {
        this.volume = volume;

        return this;
    }

    public close(): void {
        this.inputClosed = true;

        if (this.audioBuffer.length > 0 && !this.forceClose) 
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

        let chunk: Buffer = !highWaterMark ? Buffer.from(this.audioBuffer) : this.audioBuffer.subarray(0, highWaterMark);

        this.audioBuffer = !highWaterMark ? Buffer.alloc(0) : this.audioBuffer.subarray(highWaterMark, this.audioBuffer.length);

        if (this.audioBuffer.length < highWaterMark) 
        {
            const bytesPerSample = this.audioMixerArgs.bitDepth / 8;

            const silentChunkLength = (highWaterMark - chunk.length) * bytesPerSample;
            const silentChunk = Buffer.alloc(silentChunkLength);

            chunk = Buffer.concat([chunk, silentChunk]);
        }

        const changeVolumeArgs = {
            volume: this.volume,
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