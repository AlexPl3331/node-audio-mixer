import {type AudioMixerParams, type AudioInputParams} from '../src/Types/ParamsTypes';
import {type ModifiedDataView} from '../src/ModifiedDataView/ModifiedDataView';

import {readFileSync} from 'fs';
import {AudioInputUtils} from '../src/Utils/AudioInputUtils';

const inputParams: AudioInputParams = {
	sampleRate: 48000,
	channels: 1,
	bitDepth: 16,
	endianness: 'LE',
};

const mixerParams: AudioMixerParams = {
	sampleRate: 48000,
	channels: 1,
	bitDepth: 16,
	endianness: 'LE',
};

describe('Test AudioUtils of AudioInput', () => {
	const audioUtils = new AudioInputUtils(inputParams, mixerParams);

	const filePath = './sounds/tests/bitDepth';
	const load16Bit = readFileSync(`${filePath}/16bit.pcm`);

	function changeDepth(): ModifiedDataView {
		const copyBuffer = Int8Array.from(load16Bit);

		return audioUtils.setAudioData(copyBuffer)
			.checkBitDepth()
			.getAudioData();
	}

	it('Change bitDepth to 8', () => {
		const load8Bit = readFileSync(`${filePath}/8bit.pcm`);
		mixerParams.bitDepth = 8;

		const result = changeDepth();

		expect(result.buffer).toEqual(load8Bit.buffer);
	});

	it('Change bitDepth to 24', () => {
		const load24Bit = readFileSync(`${filePath}/24bit.pcm`);
		mixerParams.bitDepth = 24;

		const result = changeDepth();

		expect(result.buffer).toEqual(load24Bit.buffer);
	});

	it('Change bitDepth to 32', () => {
		const load32Bit = readFileSync(`${filePath}/32bit.pcm`);
		mixerParams.bitDepth = 32;

		const result = changeDepth();

		expect(result.buffer).toEqual(load32Bit.buffer);
	});
});
