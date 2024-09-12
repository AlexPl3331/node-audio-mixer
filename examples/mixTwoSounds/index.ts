import {createReadStream, createWriteStream} from 'fs';
import {AudioMixer} from '../../src';

const mixer = new AudioMixer({
	sampleRate: 48000,
	bitDepth: 16,
	channels: 1,
	autoClose: true,
});

const inputNature = mixer.createAudioInput({
	sampleRate: 44100,
	bitDepth: 16,
	channels: 1,
});
const inputCampfire = mixer.createAudioInput({
	sampleRate: 44100,
	bitDepth: 16,
	channels: 1,
	volume: 35,
});

const writeStream = createWriteStream('./mixed.pcm');

const natureSound = createReadStream('./sounds/nature/nature.pcm');
const campFireSound = createReadStream('./sounds/nature/campfire.pcm');

mixer.pipe(writeStream);

natureSound.pipe(inputNature);
campFireSound.pipe(inputCampfire);
