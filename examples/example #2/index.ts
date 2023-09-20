import { createReadStream, createWriteStream } from "fs";
import { AudioMixer } from "../../src";

// Count to N number

const MAX_NUMBER_LENGTH = 5;
const path = "../../..";

const audioMixer: AudioMixer = new AudioMixer({ sampleRate: 48000, bitDepth: 16, channels: 1 });
const outputFile = createWriteStream("./count.pcm");

audioMixer.pipe(outputFile);

function generateAudioNumber(maxNumberLength: number, currentNumber: number): void {
    if (maxNumberLength === currentNumber) 
    {
        audioMixer.close();
        return;
    };

    const loadNumberFile = createReadStream(`${path}/sounds/count/${currentNumber + 1}.pcm`);

    const audioInput = audioMixer.createAudioInput({
        sampleRate: 48000,
        bitDepth: 16,
        channels: 1
    });

    loadNumberFile.pipe(audioInput);

    audioMixer.once("removeInput", () => { generateAudioNumber(maxNumberLength, currentNumber + 1); });
}

generateAudioNumber(MAX_NUMBER_LENGTH, 0);