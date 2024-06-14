import {type AudioMixerParams, type AudioInputParams, type OmitAudioParams} from '../Types/ParamTypes';

import {Readable} from 'stream';

import {AudioMixerUtils} from '../Utils/AudioMixerUtils';
import {AudioInput} from '../AudioInput/AudioInput';

export class AudioMixer extends Readable {
	private readonly mixerParams: AudioMixerParams;
	private readonly audioUtils: AudioMixerUtils;

	private delayTimeValue = 5;
	private isWork = false;

	private readonly inputs: AudioInput[] = [];

	constructor(params: AudioMixerParams) {
		super();

		this.mixerParams = params;
		this.audioUtils = new AudioMixerUtils(params);

		if (params.delayTime && typeof params.delayTime === 'number') {
			this.delayTimeValue = params.delayTime;
		}

		this.loopRead();
	}

	get params(): Readonly<AudioMixerParams> {
		return this.mixerParams;
	}

	set params(params: OmitAudioParams<AudioMixerParams>) {
		Object.assign(this.mixerParams, params);
	}

	_read(): void {
		const allInputsSize: number[] = this.inputs.map((input: AudioInput) => input.dataSize)
			.filter(size => size >= (this.params.highWaterMark ?? (this.params.bitDepth / 8)));

		const minDataSize: number = this.mixerParams.highWaterMark ?? Math.min(...allInputsSize);

		if (allInputsSize.length === 0) {
			if (this.mixerParams.generateSilence) {
				const silentSize = ((this.mixerParams.sampleRate * this.mixerParams.channels) / 1000) * (this.mixerParams.silentDuration ?? this.delayTimeValue);
				const silentData = new Uint8Array(silentSize);

				this.unshift(silentData);
			}

			if (this.isWork) {
				if (this.inputs.length === 0 && this.mixerParams.forceClose) {
					this.destroy();
				}
			}
		} else {
			const availableInputs = this.inputs.filter((input: AudioInput) => input.dataSize >= minDataSize);
			const dataCollection: Uint8Array[] = availableInputs.map((input: AudioInput) => input.getData(minDataSize));

			let mixedData = this.audioUtils.setAudioData(dataCollection)
				.mix()
				.checkVolume()
				.getAudioData();

			if (this.mixerParams.preProcessData) {
				mixedData = this.mixerParams.preProcessData(mixedData);
			}

			this.unshift(mixedData);
		}
	}

	_destroy(error: Error, callback: (error?: Error | undefined) => void): void {
		if (!this.closed) {
			this.inputs.forEach((input: AudioInput) => {
				input.destroy();
			});
		}

		callback(error);
	}

	public createAudioInput(inputParams: AudioInputParams): AudioInput {
		const audioInput = new AudioInput(inputParams, this.mixerParams, this.removeAudioinput.bind(this));

		this.inputs.push(audioInput);
		this.isWork ||= true;

		return audioInput;
	}

	public removeAudioinput(audioInput: AudioInput): boolean {
		const findAudioInput = this.inputs.indexOf(audioInput);

		if (findAudioInput !== -1) {
			this.inputs.splice(findAudioInput, 1);

			return true;
		}

		return false;
	}

	private loopRead(): void {
		if (!this.closed) {
			if (!this.isPaused()) {
				this._read();

				if (this.mixerParams.delayTime && typeof this.mixerParams.delayTime === 'function') {
					this.delayTimeValue = this.mixerParams.delayTime();
				}
			}

			setTimeout(this.loopRead.bind(this), this.delayTimeValue);

			return;
		}

		this.emit('end');
	}
}
