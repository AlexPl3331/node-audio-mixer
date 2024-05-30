import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamTypes';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeSampleRate(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): ModifiedDataView {
	const bytesPerElement = inputParams.bitDepth / 8;

	const isInputLe = isLittleEndian(inputParams.endianness);
	const isMixerLe = isLittleEndian(mixerParams.endianness);

	const isDownsample = inputParams.sampleRate > mixerParams.sampleRate;

	const scaleFactor = isDownsample
		? inputParams.sampleRate / mixerParams.sampleRate
		: mixerParams.sampleRate / inputParams.sampleRate;

	const dataSize = Math.floor(audioData.byteLength * (mixerParams.sampleRate / inputParams.sampleRate));

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(inputParams.bitDepth, inputParams.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(mixerParams.bitDepth, mixerParams.unsigned)}`;

	for (let index = 0; index < dataSize / bytesPerElement; index++) {
		const interpolatePosition = isDownsample ? index * scaleFactor : index / scaleFactor;

		const previousPosition = Math.floor(interpolatePosition);
		const nextPosition = previousPosition + 1;

		const previousSample = audioData[getSampleMethod](previousPosition * bytesPerElement, isInputLe);
		const nextSample = audioData[getSampleMethod](nextPosition * bytesPerElement, isInputLe);

		const interpolatedValue = ((interpolatePosition - previousPosition) * ((nextSample - previousSample) / (nextPosition - previousPosition))) + previousSample;

		allocDataView[setSampleMethod](index * bytesPerElement, interpolatedValue, isMixerLe);
	}

	inputParams.sampleRate = mixerParams.sampleRate;
	inputParams.endianness = mixerParams.endianness;

	return allocDataView;
}
