import { AudioBitDepth, AudioEndianness } from "../../Types/AudioTypes"

interface SampleRateParams {
    sampleRate: number,
    bitDepth?: AudioBitDepth,
    endianness: AudioEndianness
}

const changeSampleRate = (inputChunk: Buffer, inputArgs: SampleRateParams, outputArgs: SampleRateParams): Buffer => {
    if (inputArgs.sampleRate === outputArgs.sampleRate) return inputChunk;

    const bytesPerSample = outputArgs.bitDepth / 8;

    const outputChunkLength = Math.floor((inputChunk.length / bytesPerSample) * (outputArgs.sampleRate / inputArgs.sampleRate));
    const outputChunk = Buffer.alloc(outputChunkLength * bytesPerSample);

    for (let index = 0; index < outputChunkLength; index++)
    {
        const sampleIndex = Math.floor(index * inputArgs.sampleRate / outputArgs.sampleRate) * bytesPerSample;
        const sample = inputChunk[`readInt${inputArgs.endianness}`](sampleIndex, bytesPerSample);

        outputChunk[`writeInt${outputArgs.endianness}`](sample, index * bytesPerSample, bytesPerSample);
    }

    return outputChunk;
}

export default changeSampleRate;