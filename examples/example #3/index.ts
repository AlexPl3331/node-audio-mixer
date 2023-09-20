import { createReadStream, createWriteStream } from "fs";
import { AudioMixer } from "../../src";

// Audio code generator

const MAX_NUMBER_LENGTH = 4;
const path = "../../..";

const generateNumber = (min: number, max: number) => { return Math.floor(Math.random() * (max - min) + min); };

const audioMixer: AudioMixer = new AudioMixer({ sampleRate: 48000, bitDepth: 16, channels: 1 });
const outputFile = createWriteStream("./code.pcm");

audioMixer.pipe(outputFile);

function generateAudioNumber(maxNumberLength: number, currentNumber: number): void {
    if (maxNumberLength === currentNumber) 
    {
        audioMixer.close();
        return;
    };

    const generatedNumber = generateNumber(1, 9);
    const loadNumberFile = createReadStream(`${path}/sounds/count/${generatedNumber}.pcm`);

    const audioInput = audioMixer.createAudioInput({
        sampleRate: 48000,
        bitDepth: 16,
        channels: 1
    });

    loadNumberFile.pipe(audioInput);

    audioMixer.once("removeInput", () => { generateAudioNumber(maxNumberLength, currentNumber + 1); });
}

generateAudioNumber(MAX_NUMBER_LENGTH, 0);