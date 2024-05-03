
import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';
import {type BitDepth} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeChannelsCount(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): ModifiedDataView {
	const bytesPerElement = mixerParams.bitDepth / 8;

	const isInputLe = isLittleEndian(inputParams.endianness);
	const isMixerLe = isLittleEndian(mixerParams.endianness);

	const dataSize = Math.round(audioData.byteLength * mixerParams.channels / inputParams.channels);

	const allocData = new Int8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(inputParams.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(mixerParams.bitDepth)}`;

	for (let oldPosition = 0, newPosition = 0; oldPosition < audioData.byteLength; oldPosition += bytesPerElement) {
		const sample = audioData[getSampleMethod](oldPosition, isInputLe);

		const nextPosition = newPosition + (bytesPerElement * mixerParams.channels);

		for (newPosition; newPosition < nextPosition; newPosition += bytesPerElement) {
			allocDataView[setSampleMethod](newPosition, sample, isMixerLe);
		}
	}

	inputParams.channels = mixerParams.channels;
	inputParams.endianness = mixerParams.endianness;

	return allocDataView;
}
