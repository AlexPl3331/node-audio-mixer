import { createReadStream, createWriteStream } from "fs";
import { AudioMixer } from "../../src";

// Modifying audio parameters through the audio mixer

const path = "../../..";

const writeFile = createWriteStream("./audio.pcm");
const mixer = new AudioMixer({ sampleRate: 48000, bitDepth: 24, channels: 2, autoClose: true });

const loadCampfireFile = createReadStream(`${path}/sounds/nature/campfire.pcm`);

const inputCampfire = mixer.createAudioInput({ sampleRate: 44100, bitDepth: 16, channels: 1 });

mixer.pipe(writeFile);

loadCampfireFile.pipe(inputCampfire);