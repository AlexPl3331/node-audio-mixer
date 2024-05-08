import {Writable} from 'stream';

import {type OmitAudioParams, type AudioInputParams, type AudioMixerParams} from '../Types/ParamsTypes';

import {AudioInputUtils} from '../Utils/AudioInputUtils';

type SelfRemoveFunction = (audioInput: AudioInput) => void;

export class AudioInput extends Writable {
	private readonly audioInputParams: AudioInputParams;
	private readonly selfRemoveFunction: SelfRemoveFunction | undefined;

	private readonly audioUtils: AudioInputUtils;
	private audioData: Int8Array = new Int8Array(0);

	constructor(inputParams: AudioInputParams, mixerParams: AudioMixerParams, selfRemoveFunction?: SelfRemoveFunction) {
		super();

		this.audioInputParams = inputParams;
		this.selfRemoveFunction = selfRemoveFunction;

		this.audioUtils = new AudioInputUtils(inputParams, mixerParams);
	}

	get params(): Readonly<AudioInputParams> {
		return this.audioInputParams;
	}

	set params(params: OmitAudioParams<AudioInputParams>) {
		Object.assign(this.audioInputParams, params);
	}

	public get dataSize(): number {
		return this.audioData.length;
	}

	public _write(chunk: Int8Array, _: BufferEncoding, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			const processedData = this.audioUtils.setAudioData(chunk)
				.checkBitDepth()
				.checkSampleRate()
				.checkChannelsCount()
				.checkVolume()
				.getAudioData();

			const audioData = new Int8Array(this.audioData.length + processedData.length);

			audioData.set(this.audioData, this.audioData.length);
			audioData.set(processedData, processedData.length);

			this.audioData = audioData;
		}

		callback();
	}

	public _destroy(_: Error, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			this.emit('close');

			if (this.audioData.length === 0 || this.audioInputParams.forceClose) {
				this.removeInputSelf();
			}
		}

		callback();
	}

	public getData(size: number): Int8Array {
		const audioData = this.audioData.slice(0, size);
		this.audioData = this.audioData.slice(size);

		if (audioData.length === 0 && this.closed) {
			this.removeInputSelf();
		}

		return audioData;
	}

	private removeInputSelf(): void {
		if (this.audioData.length > 0) {
			this.audioData = new Int8Array(0);
		}

		if (typeof this.selfRemoveFunction === 'function') {
			this.selfRemoveFunction(this);
		}

		this.emit('end');
	}
}
