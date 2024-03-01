import {Writable} from 'stream';

import {type OmitAudioParams, type AudioInputParams} from '../Types/ParamsTypes';

type SelfRemoveFunction = (audioInput: AudioInput) => void;

export class AudioInput extends Writable {
	private readonly audioInputParams: AudioInputParams;
	private readonly selfRemoveFunction: SelfRemoveFunction | undefined;

	private audioData: Int8Array = new Int8Array(0);

	constructor(params: AudioInputParams, selfRemoveFunction?: SelfRemoveFunction) {
		super();

		this.audioInputParams = params;
		this.selfRemoveFunction = selfRemoveFunction;
	}

	get params(): Readonly<AudioInputParams> {
		return this.audioInputParams;
	}

	set params(params: OmitAudioParams<AudioInputParams>) {
		Object.assign(this.audioInputParams, params);
	}

	public get audioDataSize(): number {
		return this.audioData.length;
	}

	public _write(chunk: Int8Array, _: BufferEncoding, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			const audioData = new Int8Array(this.audioData.length + chunk.length);

			audioData.set(this.audioData, this.audioData.length);
			audioData.set(chunk, chunk.length);

			this.audioData = audioData;
		}

		callback();
	}

	public getAudioData(size: number): Int8Array {
		const audioData = this.audioData.subarray(0, size);

		this.audioData = this.audioData.subarray(size, this.audioData.length);

		if (audioData.length === 0 && this.closed) {
			this.removeInputSelf();
		}

		return audioData;
	}

	public closeInput(): void {
		if (!this.writableEnded) {
			this.emit('close');

			if (this.audioData.length === 0 || this.audioInputParams.closeForce) {
				this.removeInputSelf();
			}
		}
	}

	private removeInputSelf(): void {
		if (this.audioData.length > 0) {
			this.audioData = new Int8Array(0);
		}

		if (typeof this.selfRemoveFunction === 'function') {
			this.selfRemoveFunction(this);
		}

		this.end();
	}
}
