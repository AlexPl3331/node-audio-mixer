import {createReadStream, createWriteStream} from 'fs';
import {AudioMixer} from '../../src';

const writeStream = createWriteStream('./campfire.pcm');
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

// https://github.com/nodejs/node/issues/41785 (fixed in v17.5.0)
writeStream.on('drain', () => {
	mixer.resume();
});

mixer.pipe(writeStream);
campfireSound.pipe(audioInput);
