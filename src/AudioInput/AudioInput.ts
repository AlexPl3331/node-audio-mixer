import { Writable } from "stream"
import { endianness } from "os"

import { AudioMixerArgs } from "../AudioMixer/AudioMixer"
import { AudioSampleRate, AudioBitDepth, AudioEndianess } from "../Types/AudioTypes"

import changeVolume from "../Utils/ChangeVolume"
import changeSampleParams from "../Utils/ChangeSampleParams"


type SelfRemoveFunction = (audioInput: AudioInput) => void;

interface AudioInputArgs {
    sampleRate?: AudioSampleRate,
    channels?: number,
    volume?: number,
    bitDepth?: AudioBitDepth,
    endianness?: AudioEndianess,
    forceClose?: boolean
}

class AudioInput extends Writable {
    private sampleRate: AudioSampleRate;
    private channels: number;
    private volume: number;
    private bitDepth: AudioBitDepth;
    private endianness: AudioEndianess;
    private forceClose: boolean;

    private audioMixerArgs: AudioMixerArgs;
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

            if (this.audioBuffer.length > 0 && !this.forceClose) return;

            this.removeSelf(this);
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

        const processedChunk = changeSampleParams(chunk, inputParams, this.audioMixerArgs);

        this.audioBuffer = Buffer.concat([this.audioBuffer, processedChunk]);

        callback();
    }

    public setVolume(volume: number): this {
        this.volume = volume;

        return this;
    }

    public get availableAudioLength(): number {
        return this.audioBuffer?.length;
    }

    public close(): void {
        this.inputClosed = true;

        if (this.audioBuffer.length === 0 || this.forceClose) this.removeSelf(this);

        this.end();
    }

    public readAudioChunk(highWaterMark: number): Buffer {
        if (this.audioBuffer.length === 0)
        {
            if (this.inputClosed && this.removeSelf) this.removeSelf(this);

            return this.audioBuffer;
        }

        const changeVolumeArgs = {
            volume: this.volume,
            bitDepth: this.audioMixerArgs.bitDepth,
            endianness: this.audioMixerArgs.endianness
        }

        let chunk: Buffer = Buffer.alloc(0);

        chunk = this.audioBuffer.subarray(0, highWaterMark);
        this.audioBuffer = this.audioBuffer.subarray(highWaterMark, this.audioBuffer.length);

        if (this.audioBuffer.length < highWaterMark) 
        {
            const bytesPerSample = this.audioMixerArgs.bitDepth / 8;

            const silentChunkLength = (highWaterMark - chunk.length) * bytesPerSample;
            const silentChunk = Buffer.alloc(silentChunkLength);

            chunk = Buffer.concat([chunk, silentChunk]);
        }

        return changeVolume(chunk, changeVolumeArgs);
    }
}

export { AudioInput, AudioInputArgs };