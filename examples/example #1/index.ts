import { createReadStream, createWriteStream } from "fs";
import { AudioMixer } from "../../src";

// Mix two sounds

const path = "../../..";

const writeFile = createWriteStream("./mixed.pcm");
const mixer = new AudioMixer({ sampleRate: 48000, bitDepth: 16, channels: 1, volume: 80, autoClose: true });

const loadNatureFile = createReadStream(`${path}/sounds/nature/nature.pcm`);
const loadCampfireFile = createReadStream(`${path}/sounds/nature/campfire.pcm`);

const inputNature = mixer.createAudioInput({ sampleRate: 44100, bitDepth: 16, channels: 1 });
const inputCampfire = mixer.createAudioInput({ sampleRate: 44100, bitDepth: 16, channels: 1, volume: 60 });

mixer.pipe(writeFile);

loadNatureFile.pipe(inputNature);
loadCampfireFile.pipe(inputCampfire);