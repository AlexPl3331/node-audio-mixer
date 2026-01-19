import {Writable} from 'stream';
import {endianness} from 'os';

import {type OmitSomeParams, type InputParams, type MixerParams} from '../Types/ParamTypes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {type SampleRate, type BitDepth, type Endianness} from '../Types/AudioTypes';

import {InputUtils} from '../Utils/InputUtils';
import {getZeroSample} from '../Utils/General/GetZeroSample';

type SelfRemoveFunction = (audioInput: AudioInput) => void;

/**
 * Represents a class that receives audio frames and
 * gives them to `AudioMixer` when `getData` is called.
 *
 * Extends {@link Writable}.
 */
export class AudioInput extends Writable {
	private static count = 0;

	private readonly inputParams: InputParams;
	private readonly mixerParams: MixerParams;

	private readonly selfRemoveFunction: SelfRemoveFunction | undefined;

	private readonly audioUtils: InputUtils;

	private audioData: Uint8Array = new Uint8Array(0);
	private correctionBuffer: Uint8Array = new Uint8Array(0);

	/**
	 * Creates a new `AudioInput` instance.
	 *
	 * @param inputParams {@link InputParams} configuration.
	 * @param {SampleRate} [inputParams.sampleRate] Input {@link SampleRate}.
	 * @param {Number} [inputParams.channels] Number of input channels.
	 * @param {BitDepth} [inputParams.bitDepth] Input {@link BitDepth}.
	 * @param {Endianness} [inputParams.endianness] Input {@link Endianness}. Default: `The endianness of your CPU`.
	 * @param {Boolean | undefined} [inputParams.unsigned] Input audio is unsigned or not.
	 * @param {Boolean | undefined} [inputParams.float] Input audio is float or not. Cannot be enabled with `inputParams.unsigned`.
	 * @param {Number | undefined} [inputParams.volume] Input volume.
	 * @param {Function | undefined} [inputParams.preProcessData] Processes the audio frame before it's be stored in the `AudioInput`
	 * @param {String} [inputParams.name] Sets a name for the `AudioInput`. Default: `input-n`.
	 * @param {Boolean | undefined} [inputParams.forceClose] Closes the `AudioInput` and discards all audio frames from buffer.
	 * @param {Boolean | undefined} [inputParams.correctByteSize] Corrects audio frame size if it's not aligned to {@link BitDepth}.
	 *
	 * @param mixerParams {@link MixerParams} configuration.
	 * @param selfRemoveFunction Function that removes the `AudioInput` from the `AudioMixer`
	 *
	 * @example
	 * const firstInput = mixer.createAudioInput({
	 *     sampleRate: 48000,
	 *     channles: 1,
	 *     bitDepth: 16,
	 * });
	 *
	 * // Or you can create a standalone AudioInput
	 * const standaloneInput = new AudioInput(
	 *   {
	 *     sampleRate: 48000,
	 *     channles: 1,
	 *     bitDepth: 16,
	 *   },
	 *   {
	 *     sampleRate: 48000,
	 *     channles: 1,
	 *     bitDepth: 16,
	 *   }
	 *);
	 */
	constructor(inputParams: InputParams, mixerParams: MixerParams, selfRemoveFunction?: SelfRemoveFunction) {
		super();

		this.inputParams = inputParams;
		this.inputParams.endianness ??= endianness();
		this.inputParams.name ??= `input-${++AudioInput.count}`;

		this.mixerParams = mixerParams;

		this.selfRemoveFunction = selfRemoveFunction;

		this.audioUtils = new InputUtils(inputParams, mixerParams);
	}

	/**
	 * Reading returns an immutable {@link InputParams} object.
	 * Assigning updates the {@link AudioInput} params.
	 *
	 * @example
	 * // read params from input
	 * console.log(firstInput.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" }
	 *
	 * // Assign new params to the firstInput
	 * firstInput.params = {
	 *   volume: 50,
	 *   forceClose: true,
	 * };
	 *
	 * // Read it again
	 * console.log(firstInput.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" volume: 50, forceClose: true }
	 */
	get params(): Readonly<InputParams> {
		return this.inputParams;
	}

	set params(params: OmitSomeParams<InputParams>) {
		Object.assign(this.inputParams, params);
	}

	/**
	 * @protected
	 *
	 * Receives audio frames and stores them in `this.audioData`.
	 *
	 * @param chunk
	 * @param _
	 * @param callback
	 */
	_write(chunk: Uint8Array, _: BufferEncoding, callback: (error?: Error) => void): void {
		if (!this.destroyed) {
			if (this.inputParams.preProcessData) {
				chunk = this.inputParams.preProcessData(chunk);
			}

			const bytesPerElement = this.inputParams.bitDepth / 8;

			if (chunk.length % bytesPerElement !== 0) {
				chunk = this.correctByteSize(chunk);
			}

			if (chunk.length > 0) {
				const processedData = this.processData(chunk);

				const newSize = this.audioData.length + processedData.length;

				const tempChunk = new Uint8Array(newSize);
				tempChunk.set(this.audioData, 0);
				tempChunk.set(processedData, this.audioData.length);

				this.audioData = tempChunk;
			}
		}

		callback();
	}

	/**
	 * @protected
	 *
	 * Removes itself from the `AudioMixer` if the buffer is empty or `forceClose` is set.
	 *
	 * @param error
	 * @param callback
	 */
	_destroy(error: Error, callback: (error?: Error) => void): void {
		if ((this.audioData.length === 0 && this.correctionBuffer.length === 0) || this.inputParams.forceClose) {
			this.removeInputSelf();

			return;
		}

		if (this.correctionBuffer.length > 0) {
			this.audioData = this.correctByteSize(this.correctionBuffer, true);
		}

		callback(error);
	}

	/**
	 * Returns the buffer size.
	 *
	 * @returns {Number} Buffer size.
	 */
	public get dataSize(): number {
		return this.audioData.length;
	}

	/**
	 * Returns an audio frame with a given size.
	 *
	 * @param size Audio frame size.
	 * @returns {Uint8Array} An audio frame with given size.
	 */
	public getData(size: number): Uint8Array {
		const zeroSample = getZeroSample(this.inputParams.bitDepth, this.inputParams.unsigned);

		const tempChunk = new Uint8Array(size)
			.fill(zeroSample);

		const sliceEndPos = Math.min(this.audioData.length, size);

		tempChunk.set(this.audioData.slice(0, sliceEndPos));
		this.audioData = this.audioData.slice(sliceEndPos);

		if (this.audioData.length === 0 && this.destroyed) {
			this.removeInputSelf();
		}

		return tempChunk;
	}

	/**
	 * @private
	 *
	 * Corrects audio frame size if it's not aligned to `bitDepth`, or discards it if `correctByteSize` disabled.
	 *
	 * @param chunk
	 * @param isProcessed
	 * @returns {Uint8Array}
	 */
	private correctByteSize(chunk: Uint8Array, isProcessed?: boolean): Uint8Array {
		if (!this.params.correctByteSize) {
			return new Uint8Array(0);
		}

		if (this.correctionBuffer.length > 0) {
			const zeroSample = getZeroSample(this.inputParams.bitDepth, this.inputParams.unsigned);
			const newSize = chunk.length + this.correctionBuffer.length;

			const tempChunk = new Uint8Array(newSize)
				.fill(zeroSample);

			tempChunk.set(this.correctionBuffer, 0);
			tempChunk.set(chunk, this.correctionBuffer.length);

			chunk = tempChunk;

			this.correctionBuffer = new Uint8Array(0);
		}

		const bytesPerElement = (isProcessed ? this.mixerParams : this.inputParams).bitDepth / 8;

		const chunkSize = chunk.length + this.correctionBuffer.length;
		const remainder = chunkSize % bytesPerElement;
		const correctedSize = chunkSize - remainder;

		const correctedChunk = new Uint8Array(correctedSize);

		correctedChunk.set(this.correctionBuffer, 0);
		correctedChunk.set(chunk.slice(0, correctedSize), this.correctionBuffer.length);

		this.correctionBuffer = new Uint8Array(remainder);

		this.correctionBuffer.set(chunk.slice(correctedSize));

		return correctedChunk;
	}

	/**
	 * @private
	 *
	 * Processes audio frames to the `AudioMixer` parameters.
	 *
	 * @param chunk
	 * @returns {Uint8Array}
	 */
	private processData(chunk: Uint8Array): Uint8Array {
		return this.audioUtils.setAudioData(chunk)
			.checkIntType()
			.checkBitDepth()
			.checkSampleRate()
			.checkChannelsCount()
			.checkEndianness()
			.checkVolume()
			.getAudioData();
	}

	/**
	 * @private
	 *
	 * Removes {@link AudioInput} from the `AudioMixer`.
	 */
	private removeInputSelf(): void {
		if (this.audioData.length > 0) {
			this.audioData = new Uint8Array(0);
		}

		if (typeof this.selfRemoveFunction === 'function') {
			this.selfRemoveFunction(this);
		}
	}
}
