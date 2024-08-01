import {type AudioUtils} from '../Types/AudioUtils';
import {type MixerParams} from '../Types/ParamTypes';

import {changeVolume} from './AudioUtils/СhangeVolume';
import {assertVolume} from '../Asserts/AssertVolume';

import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';
import {mixAudioData} from './General/MixAudioData';

export class MixerUtils implements AudioUtils {
	private readonly audioMixerParams: MixerParams;
	private changedParams: MixerParams;

	private dataCollection: ModifiedDataView[] = [];

	private readonly emptyData = new Uint8Array(0);
	private mixedData: ModifiedDataView;

	constructor(mixerParams: MixerParams) {
		this.audioMixerParams = mixerParams;

		this.changedParams = {...this.audioMixerParams};

		this.mixedData = new ModifiedDataView(this.emptyData.buffer);
	}

	public setAudioData(audioData: Uint8Array[]): this {
		this.dataCollection = audioData.map((audioData: Uint8Array) => new ModifiedDataView(audioData.buffer));

		this.changedParams = {...this.audioMixerParams};

		return this;
	}

	public mix(): this {
		if (this.dataCollection.length > 1) {
			this.mixedData = mixAudioData(this.dataCollection, this.changedParams);
		} else {
			this.mixedData = new ModifiedDataView(this.dataCollection[0].buffer);
		}

		return this;
	}

	public checkVolume(): this {
		const volume = this.audioMixerParams.volume ?? 100;

		if (volume !== 100) {
			assertVolume(volume);

			changeVolume(this.mixedData, this.changedParams);
		}

		return this;
	}

	public getAudioData(): Uint8Array {
		return new Uint8Array(this.mixedData.buffer);
	}
}
