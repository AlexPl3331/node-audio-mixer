import {Readable} from 'stream';

import {type OmitAudioParams, type AudioMixerParams, type AudioInputParams} from '../Types/ParamsTypes';
import {AudioInput} from '../AudioInput/AudioInput';

export class AudioMixer extends Readable {
	private readonly audioMixerParams: AudioMixerParams;

	private readonly audioInputs: AudioInput[] = [];

	constructor(params: AudioMixerParams) {
		super();

		this.audioMixerParams = params;
	}

	get params(): Readonly<AudioMixerParams> {
		return this.audioMixerParams;
	}

	set params(params: OmitAudioParams<AudioMixerParams>) {
		Object.assign(this.audioMixerParams, params);
	}

	public createAudioInput(params: AudioInputParams): AudioInput {
		const audioInput = new AudioInput(params); // TODO: set remove function

		this.audioInputs.push(audioInput);

		return audioInput;
	}

	public removeAudioinput(audioInput: AudioInput): boolean {
		const findAudioInput = this.audioInputs.indexOf(audioInput);

		if (findAudioInput !== 1) {
			this.audioInputs.splice(findAudioInput, 1);

			return true;
		}

		return false;
	}
}
