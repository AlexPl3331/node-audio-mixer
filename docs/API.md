## Table of contents

- [Class: AudioMixer](#class-audiomixer)
  - [new AudioMixer(mixerArgs)](#new-audiomixermixerargs)
  - [Event: 'addInput'](#event-addinput)
  - [Event: 'removeInput'](#event-removeinput)
  - [mixer.setVolume(volume)](#mixersetvolumevolume)
  - [mixer.createAudioInput(inputArgs)](#mixercreateaudioinputinputargs)
  - [mixer.removeAudioInput(audioInput)](#mixerremoveaudioinputaudioinput)
  - [mixer.close()](#mixerclose)
- [Class: AudioInput](#class-audioinput)
  - [new AudioInput(inputArgs, mixerArgs, removeFunction?)](#new-audioinputinputargs-mixerargs-removefunction)
  - [input.setVolume(volume)](#inputsetvolumevolume)
  - [input.availableAudioLength](#inputavailableaudiolength)
  - [input.close()](#inputclose)

## Class: AudioMixer

This class represents an audio mixer. It extends the `Readable`.

### new AudioMixer(mixerArgs)

- `mixerArgs` {Object}
  
  - `sampleRate` {Number} Output sample rate from the audio mixer. <br> Default: `48000`.
  
  - `channels` {Number} Number of output channels from the audio mixer. <br> Default: `1`.
  
  - `volume` {Number} Output volume from the audio mixer. <br> Default: `100`.
  
  - `bitDepth` {Number} Output bit depth from the audio mixer. <br> Default: `16`.
  
  - `endianness` {String} Output endianness from the audio mixer. <br> Default: `The endianness of your CPU`.
  
  - `highWaterMark` {Number} Chunk size of the audio mixer's output. <br> Default: `null`.
  
  - `delayTime` {Number | Function} Audio mixing with a delay of n milliseconds. <br> Default: `1`.
  
  - `autoClose` {Boolean} The audio mixer automatically closes after all inputs are closed. <br> Default: `false`.

Create a new AudioMixer instance.

### Event 'addInput'

Emitted when you use `createAudioInput` in the audio mixer.

### Event 'removeInput'

Emitted when an audio input has been found and removed by the `removeAudioInput`. Better use, 

### mixer.setVolume(volume)

- `volume` {Number} New audio mixer volume.

Sets the volume of the audio mixer.

### mixer.createAudioInput(inputArgs)

- `inputArgs` {Object}
  
  - `sampleRate` {Number} Input sample rate in the audio input. <br> Default: `48000`.
  
  - `channels` {Number} Number of input channels in the audio input. <br> Default: `1`.
  
  - `volume` {Number} Input volume in the audio input. <br> Default: `100`.
  
  - `bitDepth` {Number} Input bit depth in the audio input. <br> Default: `16`.
  
  - `endianness` {String} Input endianness in the audio input. <br> Default: `The endianness of your CPU`.
  
  - `forceClose` {Boolean} Closes audio input even when it contains data <br> Default: `false`.

Create a new AudioInput instance and add it to the AudioMixer.

### mixer.removeAudioInput(audioInput)

- `audioInput` {AudioInput}

Remove an AudioInput from the AudioMixer if it exists.

### mixer.close()

Closes the inputs and the audio mixer.

## Class: AudioInput

This class represents an audio input. It extends the `Writable`.

### new AudioInput(inputArgs, mixerArgs, removeFunction?)

 - `inputArgs` {[AudioInputArgs](#mixercreateaudioinputinputargs)} Audio input arguments.
  
 - `mixerArgs` {[AudioMixerArgs](#new-audiomixermixerargs)} Audio mixer arguments.
  
 - `removeFunction` {Function} Function to remove an audio input from the audio mixer.

Create a new AudioInput instance.

> Note: if you want create a standalone input, ignore `removeFunction` argument.

### input.setVolume(volume)

- `volume` {Number} New audio input volume.

Sets the volume of the audio input.

> Note: AudioInput modifies the audio volume before it is read by the audio mixer.

### input.availableAudioLength

- {Number}

The available audio length from the input.

### input.close()

Closes the audio input.

> Note: AudioInput is automatically removed from the AudioMixer when it is closed.
> If the AudioInput still contains data, it will be removed after it becomes empty.
> To immediately close the audio input, set the `forceClose` option to `true`.