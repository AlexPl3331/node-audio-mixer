import { AudioBitDepth, AudioEndianness } from "../../Types/AudioTypes"

interface CountChannelsParams {
    channels: number,
    bitDepth?: AudioBitDepth,
    endianness: AudioEndianness
}


const changeChannelCount = (inputChunk: Buffer, inputArgs: CountChannelsParams, outputArgs: CountChannelsParams): Buffer => {
    if (inputArgs.channels == outputArgs.channels) return inputChunk;

    const bytesPerSample = outputArgs.bitDepth / 8;

    const outputChunkLength = Math.floor(inputChunk.length * outputArgs.channels / inputArgs.channels);
    const outputChunk = Buffer.alloc(outputChunkLength);

    const bytePerChannel = bytesPerSample * inputArgs.channels;

    for (let index = 0, nextSamples = 0; index < inputChunk.length; index += bytePerChannel)
    {
        const sample = inputChunk[`readInt${inputArgs.endianness}`](index, bytesPerSample);

        let nextSample = nextSamples + (bytesPerSample * outputArgs.channels);

        for (let currentByte = nextSamples; nextSamples < nextSample; currentByte += bytesPerSample)
        {
            outputChunk[`writeInt${outputArgs.endianness}`](sample, currentByte, bytesPerSample);

            nextSamples += bytesPerSample;
        }
    }

    return outputChunk;
}

export default changeChannelCount;