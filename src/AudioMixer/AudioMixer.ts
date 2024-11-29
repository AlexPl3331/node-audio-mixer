import {type MixerParams, type InputParams, type OmitSomeParams} from '../Types/ParamTypes';

import {Readable} from 'stream';
import {endianness} from 'os';

import {assertHighWaterMark} from '../Asserts/AssertHighWaterMark';

import {MixerUtils} from '../Utils/MixerUtils';
import {AudioInput} from '../AudioInput/AudioInput';

export class AudioMixer extends Readable {
	private readonly mixerParams: MixerParams;
	private readonly audioUtils: MixerUtils;

	private delayTimeValue = 1;
	private isWork = false;

	private readonly inputs: AudioInput[] = [];

	constructor(params: MixerParams) {
		super();

		this.mixerParams = params;
		this.mixerParams.endianness ??= endianness();

		this.audioUtils = new MixerUtils(params);

		if (params.delayTime && typeof params.delayTime === 'number') {
			this.delayTimeValue = params.delayTime;
		}

		this.loopRead();
	}

	get params(): Readonly<MixerParams> {
		return this.mixerParams;
	}

	set params(params: OmitSomeParams<MixerParams>) {
		Object.assign(this.mixerParams, params);
	}

	_read(): void {
		assertHighWaterMark(this.params.bitDepth, this.params.highWaterMark);

		const allInputsSize: number[] = this.inputs.map((input: AudioInput) => input.dataSize)
			.filter(size => size >= (this.params.highWaterMark ?? (this.params.bitDepth / 8)));

		if (allInputsSize.length > 0) {
			const minDataSize: number = this.mixerParams.highWaterMark ?? Math.min(...allInputsSize);

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

			return;
		}

		if (this.mixerParams.generateSilence) {
			const silentSize = ((this.mixerParams.sampleRate * this.mixerParams.channels) / 1000) * (this.mixerParams.silentDuration ?? this.delayTimeValue);
			const silentData = new Uint8Array(silentSize);

			this.unshift(silentData);
		}

		if (this.isWork) {
			if (this.inputs.length === 0 && this.mixerParams.autoClose) {
				this.destroy();
			}
		}
	}

	_destroy(error: Error, callback: (error?: Error) => void): void {
		if (!this.closed) {
			this.inputs.forEach((input: AudioInput) => {
				input.destroy();
			});
		}

		callback(error);
	}

	public createAudioInput(inputParams: InputParams): AudioInput {
		const audioInput = new AudioInput(inputParams, this.mixerParams, this.removeAudioinput.bind(this));

		this.inputs.push(audioInput);
		this.isWork ||= true;

		this.emit('createInput');

		return audioInput;
	}

	public removeAudioinput(audioInput: AudioInput): boolean {
		const findAudioInput = this.inputs.indexOf(audioInput);

		if (findAudioInput !== -1) {
			this.inputs.splice(findAudioInput, 1);

			this.emit('removeInput');

			return true;
		}

		return false;
	}

	private loopRead(): void {
		if (!this.closed || this.inputs.length > 0) {
			if (!this.isPaused()) {
				this._read();

				if (this.mixerParams.delayTime && typeof this.mixerParams.delayTime === 'function') {
					this.delayTimeValue = this.mixerParams.delayTime();
				}
			}

			setTimeout(this.loopRead.bind(this), this.delayTimeValue);

			return;
		}

		this.unshift(null);
	}
}
