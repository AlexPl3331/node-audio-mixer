## Table of contents
- [Class: AudioMixer](#class-audiomixer)
  - [new AudioMixer(mixerArgs)](#new-audiomixermixerargs)
  - [mixer.createAudioInput(inputArgs)](#mixercreateaudioinputinputargs)
  - [mixer.removeAudioInput(audioInput)](#mixerremoveaudioinputaudioinput)
  - [mixer.getOptions()](#mixergetoptions)
  - [mixer.setVolume(volume)](#mixersetvolumevolume)
  - [mixer.setHighWaterMark(highWaterMark)](#mixersethighwatermarkhighwatermark)
  - [mixer.setGenerateSilent(generateSilent)](#mixersetgeneratesilentgeneratesilent)
  - [mixer.setSilentDuration(silentDuration)](#mixersetsilentdurationsilentduration)
  - [mixer.setPreProcessData(preProcessData)](#mixersetpreprocessdatapreprocessdata)
  - [mixer.setDelayTime(delayTime)](#mixersetdelaytimedelaytime)
  - [mixer.setAutoClose(autoClose)](#mixersetautocloseautoclose)
  - [mixer.close()](#mixerclose)
- [Events: AudioMixer](#events-audiomixer)
  - [Event 'addInput'](#event-addinput)
  - [Event 'removeInput'](#event-removeinput)
- [Class: AudioInput](#class-audioinput)
  - [new AudioInput(inputArgs, mixerArgs, removeFunction?)](#new-audioinputinputargs-mixerargs-removefunction)
  - [input.getOptions()](#inputgetoptions)
  - [input.setVolume(volume)](#inputsetvolumevolume)
  - [input.setPreProcessData(preProcessData)](#inputsetpreprocessdatapreprocessdata)
  - [input.setForceClose(forceClose)](#inputsetforcecloseforceclose)
  - [input.close()](#inputclose)


## Class: AudioMixer
Represents a class that gathers audio frames from all [AudioInput](#class-audioinput)
and mixes them up into one audio frame with specified params.

Extends `Readable`.

### new AudioMixer(mixerArgs)
Creates a new `AudioMixer` instance.

- `mixerArgs` {Object} `mixerArgs` configuration.
  - `sampleRate` {Number} Output sample rate. <br> Default: `48000`.
  - `channels` {Number} Number of output channels <br> Default: `1`.
  - `volume` {Number} Output volume. <br> Default: `100`.
  - `bitDepth` {Number} Output bit depth. <br> Default: `16`.
  - `endianness` {String} Output endianness. <br> Default: `The endianness of your CPU`.
  - `highWaterMark` {Number | Null} Output audio frame size. <br> Default: `null`.
  - `generateSilent` {Boolean} Generates silent audio frames when there are no [AudioInputs](#class-audioinput) or they are empty. <br> Default: `false`.
  - `silentDuration` {Number | Null} Duration of silent audio frame (in ms). <br> Default: `null`.  
  - `preProcessData` {Function} Processes the audio frame before it leaves the `AudioMixer`. <br> Default: `Passes the audio frame unchanged`.
  - `delayTime` {Number | Function} Mix audio frames with delay (in ms). <br> Default: `1`.
  - `autoClose` {Boolean} Automatically destroys the `AudioMixer` when all [AudioInputs](AudioInput.md#class-audioinput) are closed. <br> Default: `false`.


### mixer.getOptions()
Returns a copy of the object [audioMixerArgs](#new-audiomixermixerargs).

### mixer.createAudioInput(inputArgs)
Create a new `AudioInput` instance and add it to the `AudioMixer`.

- `inputArgs` {Object}
  - `sampleRate` {Number} Input sample rate. <br> Default: `48000`.
  - `channels` {Number} Number of input channels. <br> Default: `1`.
  - `volume` {Number} Input volume. <br> Default: `100`.
  - `bitDepth` {Number} Input bit depth. <br> Default: `16`.
  - `endianness` {String} Input endianness. <br> Default: `The endianness of your CPU`.
  - `fillChunk` {Boolean} Fill the chunk with zeroes when it's size is less than the `highWaterMark`. <br> Default: `false`.
  - `preProcessData` {Function} Processes the audio frame before it's be stored in the `AudioInput`. <br> Default: `Passes the audio frame unchanged`.
  - `forceClose` {Boolean}Closes the `AudioInput` and discards all audio frames from buffer. <br> Default: `false`.


### mixer.removeAudioInput(audioInput)
Removes an [AudioInput](#class-audioinput) from the `AudioMixer` if it exists.

- `audioInput` {AudioInput}

### mixer.setVolume(volume)
Sets the output volume for the `AudioMixer`.

- `volume` {Number}

### mixer.setHighWaterMark(highWaterMark)
Sets a new value for `highWaterMark`.

- `highWaterMark` {Number | null}

### mixer.setGenerateSilent(generateSilent)
Sets a new value for `generateSilent`.

- `generateSilent` {Boolean}

### mixer.setSilentDuration(silentDuration)
Sets a new value for `silentDuration`.
> Note: If you set the value to `null`, it will be replaced by the `delayTime`.

- `silentDuration` {Number | Null}

### mixer.setPreProcessData(preProcessData)
Sets a new value for `preProcessData`.

- `preProcessData` {Function}

### mixer.setDelayTime(delayTime)
Sets a new value for `delayTime`.

- `delayTime` {Number}

### mixer.setAutoClose(autoClose)
Sets a new value for `autoClose`.

- `autoClose` {Boolean}

### mixer.close()
Closes the [AudioMixer](#class-audiomixer) and all [AudioInputs](#class-audioinput).


## Events: AudioMixer

### Event 'addInput'
Emitted when you use [AudioMixer.createAudioInput()](#mixercreateaudioinputinputargs).

### Event 'removeInput'
Emitted when an [AudioInput](#class-audioinput) has been removed.


## Class: AudioInput
This class represents an `AudioInput`. It extends `Writable`.

### new AudioInput(inputArgs, mixerArgs, removeFunction)
Creates a new `AudioInput` instance.

 - `inputArgs` {[AudioInputArgs](#mixercreateaudioinputinputargs)} `AudioInput` arguments.
 - `mixerArgs` {[AudioMixerArgs](#new-audiomixermixerargs)} `AudioMixer` arguments.
 - `removeFunction` {Function} Function to remove an `AudioInput` from the `AudioMixer`.

### input.getOptions()
Returns a copy of the object [AudioInputArgs](#new-audioinputinputargs-mixerargs-removefunction).

### input.setVolume(volume)
Sets the volume of the `AudioInput`.

- `volume` {Number}

### input.setPreProcessData(preProcessData)
Sets a new value for `preProcessData`.

- `preProcessData` {Function}

### input.setForceClose(forceClose)
Sets a new value for `forceClose`.

- `forceClose` {Boolean}

### input.close()
Removes itself from [AudioMixer](#class-audiomixer) if the buffer is empty or `forceClose` is set.
