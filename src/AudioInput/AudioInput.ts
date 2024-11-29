import {type OmitSomeParams, type InputParams, type MixerParams} from '../Types/ParamTypes';

import {Writable} from 'stream';
import {endianness} from 'os';

import {InputUtils} from '../Utils/InputUtils';
import {getZeroSample} from '../Utils/General/GetZeroSample';

type SelfRemoveFunction = (audioInput: AudioInput) => void;

export class AudioInput extends Writable {
	private readonly inputParams: InputParams;
	private readonly mixerParams: MixerParams;

	private readonly selfRemoveFunction: SelfRemoveFunction | undefined;

	private readonly audioUtils: InputUtils;

	private audioData: Uint8Array = new Uint8Array(0);
	private correctionBuffer: Uint8Array = new Uint8Array(0);

	constructor(inputParams: InputParams, mixerParams: MixerParams, selfRemoveFunction?: SelfRemoveFunction) {
		super();

		this.inputParams = inputParams;
		this.inputParams.endianness ||= endianness();

		this.mixerParams = mixerParams;

		this.selfRemoveFunction = selfRemoveFunction;

		this.audioUtils = new InputUtils(inputParams, mixerParams);
	}

	get params(): Readonly<InputParams> {
		return this.inputParams;
	}

	set params(params: OmitSomeParams<InputParams>) {
		Object.assign(this.inputParams, params);
	}

	public get dataSize(): number {
		return this.closed ? (this.mixerParams.highWaterMark ?? this.audioData.length) : this.audioData.length;
	}

	public _write(chunk: Uint8Array, _: BufferEncoding, callback: (error?: Error) => void): void {
		if (!this.closed) {
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

	public _destroy(error: Error, callback: (error?: Error) => void): void {
		if (!this.closed) {
			if ((this.audioData.length === 0 && this.correctionBuffer.length === 0) || this.inputParams.forceClose) {
				this.removeInputSelf();

				return;
			}

			if (this.correctionBuffer.length > 0) {
				this.audioData = this.correctByteSize(this.correctionBuffer, true);
			}
		}

		callback(error);
	}

	public getData(size: number): Uint8Array {
		const zeroSample = getZeroSample(this.inputParams.bitDepth, this.inputParams.unsigned);

		const tempChunk = new Uint8Array(size)
			.fill(zeroSample);

		if ((this.audioData.length < size && this.closed) || this.audioData.length >= size) {
			tempChunk.set(this.audioData.slice(0, size));

			this.audioData = this.audioData.slice(size);
		}

		if (this.audioData.length === 0 && this.closed) {
			this.removeInputSelf();
		}

		return tempChunk;
	}

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

	private removeInputSelf(): void {
		if (this.audioData.length > 0) {
			this.audioData = new Uint8Array(0);
		}

		if (typeof this.selfRemoveFunction === 'function') {
			this.selfRemoveFunction(this);
		}
	}
}
