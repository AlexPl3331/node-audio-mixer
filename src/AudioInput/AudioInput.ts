import {type OmitAudioParams, type AudioInputParams, type AudioMixerParams} from '../Types/ParamTypes';

import {Writable} from 'stream';

import {AudioInputUtils} from '../Utils/AudioInputUtils';

type SelfRemoveFunction = (audioInput: AudioInput) => void;

export class AudioInput extends Writable {
	private readonly inputParams: AudioInputParams;
	private readonly selfRemoveFunction: SelfRemoveFunction | undefined;

	private readonly audioUtils: AudioInputUtils;
	private audioData: Uint8Array = new Uint8Array(0);

	constructor(inputParams: AudioInputParams, mixerParams: AudioMixerParams, selfRemoveFunction?: SelfRemoveFunction) {
		super();

		this.inputParams = inputParams;
		this.selfRemoveFunction = selfRemoveFunction;

		this.audioUtils = new AudioInputUtils(inputParams, mixerParams);
	}

	get params(): Readonly<AudioInputParams> {
		return this.inputParams;
	}

	set params(params: OmitAudioParams<AudioInputParams>) {
		Object.assign(this.inputParams, params);
	}

	public get dataSize(): number {
		return this.audioData.length;
	}

	public _write(chunk: Uint8Array, _: BufferEncoding, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			if (this.inputParams.preProcessData) {
				chunk = this.inputParams.preProcessData(chunk);
			}

			const processedData = this.audioUtils.setAudioData(chunk)
				.checkIntType()
				.checkBitDepth()
				.checkSampleRate()
				.checkChannelsCount()
				.checkVolume()
				.getAudioData();

			const newSize = this.audioData.length + processedData.length;
			const audioData = new Uint8Array(newSize);

			audioData.set(this.audioData, 0);
			audioData.set(processedData, Math.abs(processedData.length - this.audioData.length - processedData.length));

			this.audioData = audioData;
		}

		callback();
	}

	public _destroy(error: Error, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			if (this.audioData.length === 0 || this.inputParams.forceClose) {
				this.removeInputSelf();
			}
		}

		callback(error);
	}

	public getData(size: number): Uint8Array {
		const audioData = this.audioData.slice(0, size);
		this.audioData = this.audioData.slice(size);

		if (this.audioData.length === 0 && this.closed) {
			this.removeInputSelf();
		}

		return audioData;
	}

	private removeInputSelf(): void {
		if (this.audioData.length > 0) {
			this.audioData = new Uint8Array(0);
		}

		if (typeof this.selfRemoveFunction === 'function') {
			this.selfRemoveFunction(this);
		}

		this.emit('end');
	}
}
