import {Readable} from 'stream';

import {type OmitAudioParams, type AudioMixerParams, type AudioInputParams} from '../Types/ParamsTypes';
import {AudioInput} from '../AudioInput/AudioInput';

export class AudioMixer extends Readable {
	private readonly audioMixerParams: AudioMixerParams;

	private readonly audioInputs: AudioInput[] = [];

	constructor(params: AudioMixerParams) {
		super();

		this.audioMixerParams = params;

		this.loopRead();
	}

	get params(): Readonly<AudioMixerParams> {
		return this.audioMixerParams;
	}

	set params(params: OmitAudioParams<AudioMixerParams>) {
		Object.assign(this.audioMixerParams, params);
	}

	_read(): void {
		const inputsWithData: AudioInput[] = this.audioInputs.filter((input: AudioInput) => input.audioDataSize > 0);

		const minAudioDataSize: number = this.audioMixerParams.highWaterMark ?? Math.min(...inputsWithData.map((input: AudioInput) => input.audioDataSize));

		const audioData: Int8Array[] = inputsWithData.map((input: AudioInput) => input.getAudioData(minAudioDataSize));

		if (audioData.length === 0) {
			if (this.audioMixerParams.generateSilent) {
				const silentData: Int8Array = new Int8Array();

				this.unshift(silentData);
			}
		}
	}

	public createAudioInput(params: AudioInputParams): AudioInput {
		const audioInput = new AudioInput(params, this.removeAudioinput.bind(this));

		this.audioInputs.push(audioInput);

		this.emit('addInput');

		return audioInput;
	}

	public removeAudioinput(audioInput: AudioInput): boolean {
		const findAudioInput = this.audioInputs.indexOf(audioInput);

		if (findAudioInput !== 1) {
			this.audioInputs.splice(findAudioInput, 1);

			this.emit('removeInput');

			return true;
		}

		return false;
	}

	public closeMixer(): void {
		if (!this.closed) {
			this.emit('close');
		}

		this.audioInputs.forEach((input: AudioInput) => {
			input.closeInput();
		});

		if (this.audioInputs.length === 0 && !this.readableEnded) {
			this.emit('end');
		}
	}

	private loopRead(): void {
		if (!this.isPaused()) {
			this._read();

			const nextTime = this.audioMixerParams.delayTime ? (typeof this.audioMixerParams.delayTime === 'number' ? this.audioMixerParams.delayTime : this.audioMixerParams.delayTime()) : 1;

			if (!this.closed && this.audioInputs.length > 0) {
				setTimeout(this.loopRead.bind(this), nextTime);
			} else {
				this.closeMixer();
			}
		}
	}
}
