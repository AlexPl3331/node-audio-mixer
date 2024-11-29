import {type AudioUtils} from '../Types/AudioUtils';
import {type InputParams, type MixerParams} from '../Types/ParamTypes';

import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';

import {assertChannelsCount} from '../Asserts/AssertChannelsCount';

import {changeVolume} from './AudioUtils/СhangeVolume';
import {changeIntType} from './AudioUtils/ChangeIntType';
import {changeBitDepth} from './AudioUtils/ChangeBitDepth';
import {changeSampleRate} from './AudioUtils/СhangeSampleRate';
import {changeChannelsCount} from './AudioUtils/СhangeChannelsCount';
import {changeEndianness} from './AudioUtils/ChangeEndianness';

export class InputUtils implements AudioUtils {
	private readonly audioInputParams: InputParams;
	private readonly audioMixerParams: MixerParams;

	private changedParams: InputParams;

	private readonly emptyData = new Uint8Array(0);
	private audioData: ModifiedDataView;

	constructor(inputParams: InputParams, mixerParams: MixerParams) {
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
			changeIntType(this.audioData, this.changedParams, this.audioMixerParams.unsigned);
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
			this.audioData = changeSampleRate(this.audioData, this.changedParams, this.audioMixerParams.sampleRate);
		}

		return this;
	}

	public checkChannelsCount(): this {
		if (this.changedParams.channels !== this.audioMixerParams.channels) {
			assertChannelsCount(this.changedParams.channels);

			this.audioData = changeChannelsCount(this.audioData, this.changedParams, this.audioMixerParams.channels);
		}

		return this;
	}

	public checkEndianness(): this {
		if (this.changedParams.endianness !== this.audioMixerParams.endianness) {
			changeEndianness(this.audioData, this.changedParams, this.audioMixerParams.endianness);
		}

		return this;
	}

	public checkVolume(): this {
		const volume = this.changedParams.volume ?? 100;

		if (volume < 100) {
			changeVolume(this.audioData, this.changedParams);
		}

		return this;
	}

	public getAudioData(): Uint8Array {
		return new Uint8Array(this.audioData.buffer);
	}
}
