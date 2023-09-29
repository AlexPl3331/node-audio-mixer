import { AudioBitDepth, AudioEndianness } from "../../Types/AudioTypes"

interface BitDepthParams {
    bitDepth: AudioBitDepth,
    endianness: AudioEndianness
}


const changeBitDepth = (inputChunk: Buffer, inputArgs: BitDepthParams, outputArgs: BitDepthParams): Buffer => {
    if (inputArgs.bitDepth === outputArgs.bitDepth) return inputChunk;

    const outputChunkLength = Math.floor(inputChunk.length * outputArgs.bitDepth / inputArgs.bitDepth);
    const outputChunk = Buffer.alloc(outputChunkLength);

    const inputBytesPerSample = inputArgs.bitDepth / 8;
    const outputBytesPerSample = outputArgs.bitDepth / 8;

    const scalingFactor = Math.pow(2, outputArgs.bitDepth - inputArgs.bitDepth);

    for (let index = 0; index < inputChunk.length; index += inputBytesPerSample)
    {
        const sample = inputChunk[`readInt${inputArgs.endianness}`](index, inputBytesPerSample);

        const scaledValue = Math.floor(sample * scalingFactor);

        outputChunk[`writeInt${outputArgs.endianness}`](scaledValue, Math.floor(index * outputBytesPerSample / inputBytesPerSample), outputBytesPerSample);
    }

    return outputChunk;
}

export default changeBitDepth;