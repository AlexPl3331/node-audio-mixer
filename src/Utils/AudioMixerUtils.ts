import {type BitDepth} from '../Types/AudioTypes';
import {type AudioUtils} from '../Types/AudioUtils';
import {type AudioMixerParams} from '../Types/ParamsTypes';

import {changeVolume} from './AudioUtils/СhangeVolume';
import {assertVolume} from '../Asserts/AssertVolume';

import {ModifiedDataView} from '../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from './General/IsLittleEndian';
import {getMethodName} from './General/GetMethodName';

export class AudioMixerUtils implements AudioUtils {
	private readonly audioMixerParams: AudioMixerParams;
	private changedParams: AudioMixerParams;

	private dataCollection: ModifiedDataView[] = [];

	private readonly emptyData = new Int8Array(0);
	private mixedData: ModifiedDataView;

	constructor(mixerParams: AudioMixerParams) {
		this.audioMixerParams = mixerParams;

		this.changedParams = {...this.audioMixerParams};

		this.mixedData = new ModifiedDataView(this.emptyData.buffer);
	}

	public setAudioData(audioData: Int8Array[]): this {
		this.dataCollection = audioData.map((audioData: Int8Array) => new ModifiedDataView(audioData.buffer));

		this.changedParams = {...this.audioMixerParams};

		return this;
	}

	public mixAudioData(): this {
		const bytesPerElement = this.changedParams.bitDepth / 8;

		const maxValue = (2 ** (this.changedParams.bitDepth - 1)) - 1;
		const minValue = -(maxValue + 1);

		const isLe = isLittleEndian(this.changedParams.endianness);

		const audioData = new Int8Array(this.dataCollection[0].byteLength);
		this.mixedData = new ModifiedDataView(audioData.buffer);

		const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(this.changedParams.bitDepth)}`;
		const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(this.changedParams.bitDepth)}`;

		for (let index = 0; index < audioData.length; index += bytesPerElement) {
			const samples = this.dataCollection.map(data => data[getSampleMethod](index, isLe));
			const mixedSample = samples.reduce((sample, nextSample) => sample + nextSample, 0);
			const clipSample = Math.min(Math.max(mixedSample, minValue), maxValue);

			this.mixedData[setSampleMethod](index, clipSample, isLe);
		}

		return this;
	}

	public checkVolume(): this {
		const volume = this.audioMixerParams.volume ?? 100;

		if (volume > 100) {
			assertVolume(volume);

			changeVolume(this.mixedData, this.changedParams);
		}

		return this;
	}

	public getAudioData(): Int8Array {
		return new Int8Array(this.mixedData.buffer);
	}
}
