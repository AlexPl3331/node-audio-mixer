import {createReadStream, createWriteStream} from 'fs';
import {AudioMixer} from '../../src';

const countTo = 5;

const mixer: AudioMixer = new AudioMixer({
	sampleRate: 48000,
	bitDepth: 16,
	channels: 1,
});

const outputFile = createWriteStream('./count.pcm');

mixer.pipe(outputFile);

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
