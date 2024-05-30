import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioInputParams, type AudioMixerParams} from '../Types/ParamTypes';

import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';

import {assertVolume} from '../Asserts/AssertVolume';
import {assertChannelsCount} from '../Asserts/AssertChannelsCount';

import {changeVolume} from './AudioUtils/СhangeVolume';
import {changeIntType} from './AudioUtils/ChangeIntType';
import {changeBitDepth} from './AudioUtils/ChangeBitDepth';
import {changeSampleRate} from './AudioUtils/СhangeSampleRate';
import {changeChannelsCount} from './AudioUtils/СhangeChannelsCount';

export class AudioInputUtils implements AudioUtils {
	private readonly audioInputParams: AudioInputParams;
	private readonly audioMixerParams: AudioMixerParams;

	private changedParams: AudioInputParams;

	private readonly emptyData = new Uint8Array(0);
	private audioData: ModifiedDataView;

	constructor(inputParams: AudioInputParams, mixerParams: AudioMixerParams) {
		this.audioInputParams = inputParams;
		this.audioMixerParams = mixerParams;

		this.changedParams = {...this.audioInputParams};

		this.audioData = new ModifiedDataView(this.emptyData.buffer);
	}

	public setAudioData(audioData: Uint8Array): this {
		this.audioData = new ModifiedDataView(audioData.buffer);
		this.changedParams = {...this.audioInputParams};

		return this;
	}

	public checkIntType(): this {
		if (Boolean(this.changedParams.unsigned) !== Boolean(this.audioMixerParams.unsigned)) {
			changeIntType(this.audioData, this.changedParams, this.audioMixerParams);
		}

		return this;
	}

	public checkBitDepth(): this {
		if (this.changedParams.bitDepth !== this.audioMixerParams.bitDepth) {
			this.audioData = changeBitDepth(this.audioData, this.changedParams, this.audioMixerParams);
		}

		return this;
	}

	public checkSampleRate(): this {
		if (this.changedParams.sampleRate !== this.audioMixerParams.sampleRate) {
			this.audioData = changeSampleRate(this.audioData, this.changedParams, this.audioMixerParams);
		}

		return this;
	}

	public checkChannelsCount(): this {
		if (this.changedParams.channels !== this.audioMixerParams.channels) {
			assertChannelsCount(this.changedParams.channels);

			this.audioData = changeChannelsCount(this.audioData, this.changedParams, this.audioMixerParams);
		}

		return this;
	}

	public checkVolume(): this {
		const volume = this.changedParams.volume ?? 100;

		if (volume !== 100) {
			assertVolume(volume);

			changeVolume(this.audioData, this.changedParams);
		}

		return this;
	}

	public getAudioData(): Uint8Array {
		return new Uint8Array(this.audioData.buffer);
	}
}
