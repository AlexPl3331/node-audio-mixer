import { AudioInputArgs } from "../AudioInput/AudioInput"
import { AudioMixerArgs } from "../AudioMixer/AudioMixer"

import changeBitDepth from "./AudioOptions/ChangeBitDepth"
import changeChannelCount from "./AudioOptions/ChangeChannelCount"
import changeSampleRate from "./AudioOptions/ChangeSampleRate"


const changeSampleOptions = (inputChunk: Buffer, inputArgs: AudioInputArgs, mixerArgs: AudioMixerArgs): Buffer => {
    inputChunk = changeBitDepth(inputChunk,
        {
            bitDepth: inputArgs.bitDepth,
            endianness: inputArgs.endianness
        },
        {
            bitDepth: mixerArgs.bitDepth,
            endianness: mixerArgs.endianness
        });

    inputChunk = changeSampleRate(inputChunk,
        {
            sampleRate: inputArgs.sampleRate,
            endianness: inputArgs.endianness
        },
        {
            sampleRate: mixerArgs.sampleRate,
            bitDepth: mixerArgs.bitDepth,
            endianness: mixerArgs.endianness
        });

    inputChunk = changeChannelCount(inputChunk,
        {
            channels: inputArgs.channels,
            endianness: inputArgs.endianness
        },
        {
            channels: mixerArgs.channels,
            bitDepth: mixerArgs.bitDepth,
            endianness: mixerArgs.endianness
        });

    return inputChunk;
}

export default changeSampleOptions;