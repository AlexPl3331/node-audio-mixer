import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioMixerParams} from '../Types/ParamsTypes';

export class AudioMixerUtils implements AudioUtils {
	private readonly audioMixerParams: AudioMixerParams;

	private audioData: DataView[] = [];

	constructor(params: AudioMixerParams) {
		this.audioMixerParams = params;
	}

	public setAudioData(audioData: Int8Array[]): this {
		this.audioData = audioData.map((audioData: Int8Array) => new DataView(audioData.buffer));
		return this;
	}

	public changeVolume(): this {
		return this;
	}

	public getAudioData(): this {
		this.audioData.length = 0;
		return this;
	}
}
