## Table of contents

- [Class: AudioMixer](#class-audiomixer)
  - [new AudioMixer(mixerArgs)](#new-audiomixermixerargs)
  - [Event: 'addInput'](#event-addinput)
  - [Event: 'removeInput'](#event-removeinput)
  - [mixer.getOptions()](#mixergetoptions)
  - [mixer.setVolume(volume)](#mixersetvolumevolume)
  - [mixer.setHighWaterMark(highWaterMark)](#mixersethighwatermarkhighwatermark)
  - [mixer.setGenerateSilent(generateSilent)](#mixersetgeneratesilentgeneratesilent)
  - [mixer.setSilentDuration(silentDuration)](#mixersetsilentdurationsilentduration)
  - [mixer.setPreProcessData(preProcessData)](#mixersetpreprocessdatapreprocessdata)
  - [mixer.setDelayTime(delayTime)](#mixersetdelaytimedelaytime)
  - [mixer.setAutoClose(autoClose)](#mixersetautocloseautoclose)
  - [mixer.createAudioInput(inputArgs)](#mixercreateaudioinputinputargs)
  - [mixer.removeAudioInput(audioInput)](#mixerremoveaudioinputaudioinput)
  - [mixer.close()](#mixerclose)
- [Class: AudioInput](#class-audioinput)
  - [new AudioInput(inputArgs, mixerArgs, removeFunction?)](#new-audioinputinputargs-mixerargs-removefunction)
  - [input.getOptions()](#inputgetoptions)
  - [input.setVolume(volume)](#inputsetvolumevolume)
  - [input.setPreProcessData(preProcessData)](#mixersetpreprocessdatapreprocessdata-1)
  - [input.setForceClose(forceClose)](#inputsetforcecloseforceclose)
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
  
  - `highWaterMark` {Number | Null} Chunk size of the audio mixer's output. <br> Default: `null`.
  
  - `generateSilent` {Boolean} Generate silent chunks when there are no audio inputs or when audio inputs are empty. <br> Default: `false`.
  
  - `silentDuration` {Number | Null} Duration of the silent audio chunk. <br> Default: `null`.  
  
  - `preProcessData` {Function} Process the chunk before returning from AudioMixer. <br> Default: `Returns the same audio chunk`.
  
  - `delayTime` {Number | Function} Audio mixing with a delay of n milliseconds. <br> Default: `1`.
  
  - `autoClose` {Boolean} The audio mixer automatically closes after all inputs are closed. <br> Default: `false`.

Create a new AudioMixer instance.

### Event 'addInput'

Emitted when you use `createAudioInput` in the audio mixer.

### Event 'removeInput'

Emitted when an audio input has been found and removed by the `removeAudioInput`.
> Note: Better use this event when `forceClose` is set to `false` in AudioInput, instead of using `close` or `end`.

### mixer.getOptions()

Return a copy of the object [audioMixerArgs](#new-audiomixermixerargs).

### mixer.setVolume(volume)

- `volume` {Number} New audio mixer volume.

Sets the volume of the audio mixer.

### mixer.setHighWaterMark(highWaterMark)

- `highWaterMark` {Number | null} Updated value for `highWaterMark`.

Set an updated value for `highWaterMark`.

### mixer.setGenerateSilent(generateSilent)

- `generateSilent` {Boolean} Updated value for `generateSilent`.

Set an updated value for `generateSilent`.

### mixer.setSilentDuration(silentDuration)

- `silentDuration` {Number | Null} Updated value for `silentDuration`.

Set an updated value for `silentDuration`.
> Note: If you set the value to `null`, the `silentDuration` will be replaced by the `delayTime`.

### mixer.setPreProcessData(preProcessData)

- `preProcessData` {Function} Updated value for `preProcessData`.

Set an updated value for `preProcessData`.

### mixer.setDelayTime(delayTime)

- `delayTime` {Number} Updated value for `delayTime`.

Set an updated value for `delayTime`.

### mixer.setAutoClose(autoClose)

- `autoClose` {Boolean} Updated value for `autoClose`.

Set an updated value for `autoClose`.

### mixer.createAudioInput(inputArgs)

- `inputArgs` {Object}
  
  - `sampleRate` {Number} Input sample rate in the audio input. <br> Default: `48000`.
  
  - `channels` {Number} Number of input channels in the audio input. <br> Default: `1`.
  
  - `volume` {Number} Input volume in the audio input. <br> Default: `100`.
  
  - `bitDepth` {Number} Input bit depth in the audio input. <br> Default: `16`.
  
  - `endianness` {String} Input endianness in the audio input. <br> Default: `The endianness of your CPU`.
  
  - `fillChunk` {Boolean} Fill the chunk with zeroes when it's size is less than the `highWaterMark`. <br> Default: `false`.
  
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

> Note: if you want create a standalone input, ignore `removeFunction` option.

### input.getOptions()

Return a copy of the object [AudioInputArgs](#new-audioinputinputargs-mixerargs-removefunction).

### input.setVolume(volume)

- `volume` {Number} New audio input volume.

Sets the volume of the audio input.
> Note: AudioInput modifies the audio volume before it is read by the audio mixer.

### mixer.setPreProcessData(preProcessData)

- `preProcessData` {Function} Updated value for `preProcessData`.

Set an updated value for `preProcessData`.

### input.setForceClose(forceClose)

- `forceClose` {Boolean} New value for `forceClose`.

Set a new value for `forceClose`.

### input.close()

Closes the audio input.

> Note: AudioInput is automatically removed from the AudioMixer when it is closed.
> If the AudioInput still contains data, it will be removed after it becomes empty.
> To immediately close the audio input, set the `forceClose` option to `true`.