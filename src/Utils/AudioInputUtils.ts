import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';

import {changeBitDepth} from './AudioUtils/ChangeBitDepth';
import {changeSampleRate} from './AudioUtils/СhangeSampleRate';

import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioInputParams, type AudioMixerParams} from '../Types/ParamsTypes';

export class AudioInputUtils implements AudioUtils {
	private readonly audioInputParams: AudioInputParams;
	private readonly audioMixerParams: AudioMixerParams;

	private changedParams: AudioInputParams;

	private readonly emptyData = new Int8Array(0);
	private audioData: ModifiedDataView;

	constructor(inputParams: AudioInputParams, mixerParams: AudioMixerParams) {
		this.audioInputParams = inputParams;
		this.audioMixerParams = mixerParams;

		this.changedParams = {...this.audioInputParams};

		this.audioData = new ModifiedDataView(this.emptyData.buffer);
	}

	public setAudioData(audioData: Int8Array): this {
		this.audioData = new ModifiedDataView(audioData.buffer);
		this.changedParams = {...this.audioInputParams};

		return this;
	}

	public checkBitDepth(): this {
		if (this.changedParams.bitDepth !== this.audioMixerParams.bitDepth) {
			this.audioData = changeBitDepth(this.audioData, this.changedParams, this.audioMixerParams);

			this.changedParams.bitDepth = this.audioMixerParams.bitDepth;
			this.changedParams.endianness = this.audioMixerParams.endianness;
		}

		return this;
	}

	public checkSampleRate(): this {
		if (this.changedParams.sampleRate !== this.audioMixerParams.sampleRate) {
			this.audioData = changeSampleRate(this.audioData, this.changedParams, this.audioMixerParams);

			this.changedParams.sampleRate = this.audioMixerParams.sampleRate;
			this.changedParams.endianness = this.audioMixerParams.endianness;
		}

		return this;
	}

	public changeVolume(): this {
		return this;
	}

	public getAudioData(): Int8Array {
		return new Int8Array(this.audioData.buffer);
	}
}
