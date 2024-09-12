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
This class represents an `AudioMixer`. It extends `Readable`.

### new AudioMixer(mixerArgs)
- `mixerArgs` {Object}
  - `sampleRate` {Number} Output sample rate from the `AudioMixer`. <br> Default: `48000`.

  - `channels` {Number} Number of output channels from the `AudioMixer`. <br> Default: `1`.

  - `volume` {Number} Output volume from the `AudioMixer`. <br> Default: `100`.

  - `bitDepth` {Number} Output bit depth from the `AudioMixer`. <br> Default: `16`.

  - `endianness` {String} Output endianness from the `AudioMixer`. <br> Default: `The endianness of your CPU`.

  - `highWaterMark` {Number | Null} Chunk output size from the `AudioMixer`. <br> Default: `null`.

  - `generateSilent` {Boolean} Generate silent chunk when there are no `AudioInput` or they are empty. <br> Default: `false`.

  - `silentDuration` {Number | Null} Duration in milliseconds of the silent chunk. <br> Default: `null`.  

  - `preProcessData` {Function} Process the chunk before returning it from `AudioMixer`. <br> Default: `Returns the same audio chunk`.

  - `delayTime` {Number | Function} Audio mixing with a delay of n milliseconds. <br> Default: `1`.

  - `autoClose` {Boolean} Automatically closes after all `AudioInput` are closed. <br> Default: `false`.

Creates a new `AudioMixer` instance.

### mixer.getOptions()
Returns a copy of the object [audioMixerArgs](#new-audiomixermixerargs).

### mixer.createAudioInput(inputArgs)
- `inputArgs` {Object}

  - `sampleRate` {Number} Input sample rate in the `AudioInput`. <br> Default: `48000`.

  - `channels` {Number} Number of input channels in the `AudioInput`. <br> Default: `1`.

  - `volume` {Number} Input volume in the `AudioInput`. <br> Default: `100`.

  - `bitDepth` {Number} Input bit depth in the `AudioInput`. <br> Default: `16`.

  - `endianness` {String} Input endianness in the `AudioInput`. <br> Default: `The endianness of your CPU`.

  - `fillChunk` {Boolean} Fill the chunk with zeroes when it's size is less than the `highWaterMark`. <br> Default: `false`.

  - `preProcessData` {Function} Process the chunk before returning it to `AudioMixer`. <br> Default: `Returns the same audio chunk`.

  - `forceClose` {Boolean} Closes `AudioInput` even when it contains data <br> Default: `false`.

Create a new `AudioInput` instance and add it to the `AudioMixer`.

### mixer.removeAudioInput(audioInput)
- `audioInput` {AudioInput}

Removes an `AudioInput` from the `AudioMixer` if it exists.

### mixer.setVolume(volume)
- `volume` {Number}

Sets the volume of the `AudioMixer`.

### mixer.setHighWaterMark(highWaterMark)
- `highWaterMark` {Number | null}

Sets an new value for `highWaterMark`.

### mixer.setGenerateSilent(generateSilent)
- `generateSilent` {Boolean}

Sets an new value for `generateSilent`.

### mixer.setSilentDuration(silentDuration)
- `silentDuration` {Number | Null}

Sets an new value for `silentDuration`.

> Note: If you set the value to `null`, it will be replaced by the `delayTime`.

### mixer.setPreProcessData(preProcessData)
- `preProcessData` {Function}

Sets an new value for `preProcessData`.

### mixer.setDelayTime(delayTime)
- `delayTime` {Number}

Sets an new value for `delayTime`.

### mixer.setAutoClose(autoClose)
- `autoClose` {Boolean}

Sets an new value for `autoClose`.

### mixer.close()
Closes the `AudioInputs` and the `AudioMixer`.


## Events: AudioMixer

### Event 'addInput'
Emitted when you use `createAudioInput` in the `AudioMixer`.

### Event 'removeInput'
Emitted when an `AudioInput` has been removed.
> Note: Better use this event when `forceClose` is set to `false` in `AudioInput`, instead of using `close` or `end`.


## Class: AudioInput
This class represents an `AudioInput`. It extends `Writable`.

### new AudioInput(inputArgs, mixerArgs, removeFunction)
 - `inputArgs` {[AudioInputArgs](#mixercreateaudioinputinputargs)} `AudioInput` arguments.
  
 - `mixerArgs` {[AudioMixerArgs](#new-audiomixermixerargs)} `AudioMixer` arguments.
  
 - `removeFunction` {Function} Function to remove an `AudioInput` from the `AudioMixer`.

Creates a new `AudioInput` instance.

### input.getOptions()
Returns a copy of the object [AudioInputArgs](#new-audioinputinputargs-mixerargs-removefunction).

### input.setVolume(volume)
- `volume` {Number}

Sets the volume of the `AudioInput`.

### input.setPreProcessData(preProcessData)
- `preProcessData` {Function}

Sets an new value for `preProcessData`.

### input.setForceClose(forceClose)
- `forceClose` {Boolean}

Sets a new value for `forceClose`.

### input.close()
Closes the `AudioInput`.

> Note: `AudioInput` is automatically removes from the `AudioMixer` when it is closed.
> If the `AudioInput` still contains data, it will be removed after it becomes empty.
> To remove it immediately, set `forceClose` to `true`.