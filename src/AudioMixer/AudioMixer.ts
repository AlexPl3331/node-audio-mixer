import {Readable} from 'stream';
import {endianness} from 'os';

import {type MixerParams, type InputParams, type OmitSomeParams} from '../Types/ParamTypes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {type SampleRate, type BitDepth, type Endianness} from '../Types/AudioTypes';

import {assertHighWaterMark} from '../Asserts/AssertHighWaterMark';

import {MixerUtils} from '../Utils/MixerUtils';
import {AudioInput} from '../AudioInput/AudioInput';
import {getZeroSample} from '../Utils/General/GetZeroSample';

/**
 * Represents a class that gathers audio frames from all {@link AudioInput}
 * and mixes them up into one audio frame with specified params.
 *
 * Extends {@link Readable}
 *
 * @emits "createInput" - When new {@link AudioInput} is created.
 * @emits "removeInput" - When {@link AudioInput} is removed.
 */
export class AudioMixer extends Readable {
	private readonly mixerParams: MixerParams;
	private readonly audioUtils: MixerUtils;

	private delayTimeValue = 1;
	private isWork = false;

	private readonly inputs: AudioInput[] = [];

	/**
	 * Creates an `AudioMixer` instance.
	 *
	 * @param params {@link MixerParams} configuration.
	 * @param {SampleRate} [params.sampleRate] Output {@link SampleRate}.
	 * @param {Number} [params.channels] Number of output channels.
	 * @param {BitDepth} [params.bitDepth] Output {@link BitDepth}.
	 * @param {Endianness} [params.endianness] Output {@link Endianness}. Default: `The endianness of your CPU`.
	 * @param {Boolean | undefined} [params.unsigned] Output audio must be unsigned or not.
	 * @param {Boolean | undefined} [params.float] Output audio must be float or not. Cannot be enabled with `params.unsigned`.
	 * @param {Number | undefined} [params.volume] Output volume.
	 * @param {Function | undefined} [params.preProcessData] Processes the audio frame before it leaves the `AudioMixer`.
	 * @param {Number | undefined} [params.highWaterMark] Output audio frame size.
	 * @param {Boolean | undefined} [params.autoClose] Automatically closes the `AudioMixer` when all {@link AudioInput} are closed.
	 * @param {Boolean | undefined} [params.generateSilent] Generates silent audio frames when there are no {@link AudioInput} or when they are empty.
	 * @param {Number | undefined} [params.silentDuration] Duration of silent audio frame (in ms).
	 * @param {Number | Function} [params.delayTime] Mix audio frames with delay (in ms).
 	 *
	 * @example
	 * const mixer = new AudioMixer({
	 * sampleRate: 48000,
	 * channels: 1,
	 * bitDepth: 16,
	 * });
	 */
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

	/**
	 * Reading returns an immutable {@link MixerParams} object.
	 * Assigning updates the {@link AudioMixer} params.
	 *
	 * @example
	 * // read params from mixer
	 * console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" }
	 *
	 * // Assign new params to the mixer
	 * mixer.params = {
	 * volume: 50,
	 * autoClose: true,
	 * };
	 *
	 * // Read it again
	 * console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" volume: 50, autoClose: true }
	 */
	get params(): Readonly<MixerParams> {
		return this.mixerParams;
	}

	set params(params: OmitSomeParams<MixerParams>) {
		Object.assign(this.mixerParams, params);
	}

	/**
	 * @protected
	 *
	 * Gather all audio frames from {@link AudioInput}
	 * and mix them up into one audio frame.
	 */
	_read(): void {
		assertHighWaterMark(this.mixerParams.bitDepth, this.mixerParams.highWaterMark);

		const allInputsSize: number[] = this.inputs.map((input: AudioInput) => input.dataSize)
			.filter(size => size >= (this.mixerParams.highWaterMark ?? (this.mixerParams.bitDepth / 8)));

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
			const silentSize = (((this.mixerParams.sampleRate * this.mixerParams.channels) / 1000) * (this.mixerParams.silentDuration ?? this.delayTimeValue)) * (this.mixerParams.bitDepth / 8);
			const silentData = new Uint8Array(silentSize);

			silentData.fill(getZeroSample(this.mixerParams.bitDepth, this.mixerParams.unsigned));

			this.unshift(silentData);
		}

		if (this.isWork) {
			if (this.inputs.length === 0 && this.mixerParams.autoClose) {
				this.destroy();
			}
		}
	}

	/**
	 * @protected
	 *
	 * Destroy all {@link AudioInput}s when "destroy()" is called in `AudioMixer`.
	 *
	 * @param error
	 * @param callback
	 */
	_destroy(error: Error, callback: (error?: Error) => void): void {
			this.inputs.forEach((input: AudioInput) => {
				input.destroy();
			});

		callback(error);
	}

	/**
	 * Creates a new {@link AudioInput} instance and adds it to the {@link AudioMixer}.
	 *
	 * @param inputParams
	 * @returns {AudioInput}
	 *
	 * @example
	 * // Create AudioInput through the AudioMixer
	 * const firstInput = mixer.createAudioInput({
	 *		sampleRate: 48000,
	 *		channels: 1,
	 *		bitDepth: 16,
	 *		volume: 90,
	 * });
	 *
	 * // Or you can create standalone instance of AudioInput
	 * const secondInput = new AudioInput({
	 *		sampleRate: 48000,
	 *		channels: 1,
	 *		bitDepth: 16,
	 *		volume: 90,
	 * },
	 * {
	 *		sampleRate: 48000,
	 *		channels: 1,
	 *		bitDepth: 16,
	 *		volume: 90,
	 * });
	 */
	public createAudioInput(inputParams: InputParams): AudioInput {
		const audioInput = new AudioInput(inputParams, this.mixerParams, this.removeAudioinput.bind(this));

		this.inputs.push(audioInput);
		this.isWork ||= true;

		this.emit('createInput');

		return audioInput;
	}

	/**
	 * Removes an {@link AudioInput} from the {@link AudioMixer} if it exists.
	 * @param audioInput {@link AudioInput} instance.
	 * @returns {boolean} true or false
	 *
	 * @example
	 * // Removing the first AudioInput
	 * console.log(mixer.removeAudioInput(firstInput)); // true
	 *
	 * // Attempt to remove the same AudioInput
	 * console.log(mixer.removeAudioInput(firstInput)); // false
	 */
	public removeAudioinput(audioInput: AudioInput): boolean {
		const findAudioInput = this.inputs.indexOf(audioInput);

		if (findAudioInput !== -1) {
			this.inputs.splice(findAudioInput, 1);

			this.emit('removeInput');

			return true;
		}

		return false;
	}

	/**
	 * @private
	 *
	 * Calls `_read()` when {@link AudioMixer} is not paused
	 */
	private loopRead(): void {
		if (!this.destroyed || this.inputs.length > 0) {
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
