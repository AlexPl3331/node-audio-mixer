import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';

import {changeBitDepth} from './AudioUtils/ChangeBitDepth';

import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioInputParams, type AudioMixerParams} from '../Types/ParamsTypes';

export class AudioInputUtils implements AudioUtils {
	private readonly audioInputParams: AudioInputParams;
	private readonly audioMixerParams: AudioMixerParams;

	private readonly emptyData = new Int8Array(0);
	private audioData: ModifiedDataView;

	constructor(inputParams: AudioInputParams, mixerParams: AudioMixerParams) {
		this.audioInputParams = inputParams;
		this.audioMixerParams = mixerParams;

		this.audioData = new ModifiedDataView(this.emptyData.buffer);
	}

	public setAudioData(audioData: Int8Array): this {
		this.audioData = new ModifiedDataView(audioData.buffer);
		return this;
	}

	public checkBitDepth(): this {
		if (this.audioInputParams.bitDepth !== this.audioMixerParams.bitDepth) {
			this.audioData = changeBitDepth(this.audioData, this.audioInputParams, this.audioMixerParams);
		}

		return this;
	}

	public changeVolume(): this {
		return this;
	}

	public getAudioData(): ModifiedDataView {
		return this.audioData;
	}
}
