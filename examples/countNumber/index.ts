import {createReadStream, createWriteStream} from 'fs';
import {AudioMixer} from '../../src';

const countTo = 5;

const mixer: AudioMixer = new AudioMixer({
	sampleRate: 48000,
	bitDepth: 16,
	channels: 1,
});

const writeStream = createWriteStream('./count.pcm');

// https://github.com/nodejs/node/issues/41785 (fixed in v17.5.0)
writeStream.on('drain', () => {
	mixer.resume();
});

mixer.pipe(writeStream);

function getNextNumber(maxNumberLength: number, currentNumber: number): void {
	if (currentNumber > maxNumberLength) {
		setTimeout(() => {
			mixer.destroy();
		}, 100);

		return;
	}

	const numberSound = createReadStream(`./sounds/count/${currentNumber}.pcm`);

	const audioInput = mixer.createAudioInput({
		sampleRate: 48000,
		bitDepth: 16,
		channels: 1,
	});

	numberSound.pipe(audioInput);

	mixer.once('removeInput', () => {
		getNextNumber(maxNumberLength, currentNumber + 1);
	});
}

getNextNumber(countTo, 1);
