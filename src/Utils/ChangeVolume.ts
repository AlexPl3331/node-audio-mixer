import { AudioBitDepth, AudioEndianness } from "../Types/AudioTypes"

interface ChangeVolumeArgs {
    volume: number
    bitDepth: AudioBitDepth
    endianness: AudioEndianness
}


const changeVolume = (inputChunk: Buffer, args: ChangeVolumeArgs): Buffer => {
    const volume = args.volume / 100;

    if (volume < 0 || volume > 1) throw Error("Volume range must be from 0 to 100.");

    if (volume === 1) return inputChunk;

    const bytesPerSample = args.bitDepth / 8;
    const outputChunk = Buffer.alloc(inputChunk.length);

    for (let index = 0; index < inputChunk.length; index += bytesPerSample)
    {
        const sample = inputChunk[`readInt${args.endianness}`](index, bytesPerSample);
        outputChunk[`writeInt${args.endianness}`](Math.floor(sample * volume), index, bytesPerSample);
    }

    return outputChunk;
}

export default changeVolume;