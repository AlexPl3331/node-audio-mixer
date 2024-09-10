import {createReadStream, createWriteStream} from 'fs';
import {AudioMixer} from '../../src';

const writeFile = createWriteStream('./campfire.pcm');
const mixer = new AudioMixer({
	sampleRate: 48000,
	bitDepth: 24,
	channels: 2,
	autoClose: true,
});

const audioInput = mixer.createAudioInput({
	sampleRate: 48000,
	bitDepth: 16,
	channels: 1,
});

const campfireSound = createReadStream('./sounds/nature/campfire.pcm');

mixer.pipe(writeFile);
campfireSound.pipe(audioInput);
