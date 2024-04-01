import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioMixerParams} from '../Types/ParamsTypes';

import {assertVolume} from '../Asserts/AssertVolume';
import {changeVolume} from './AudioUtils/СhangeVolume';

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

	public checkVolume(): this {
		if (this.audioMixerParams.volume && this.audioMixerParams.volume !== 100) {
			assertVolume(this.audioMixerParams.volume);

			// ChangeVolume(this.audioData, this.audioMixerParams);
		}

		return this;
	}

	public getAudioData(): Int8Array {
		return new Int8Array(0);
	}
}
