## [2.2.0] - 2026-01-19
### Added
- JSDoc comments.
- AudioInput:
  - New option: [name](./docs/api/v2/AudioInput.md#new-audioinputinputparams-mixerparams-removefunction) - Sets a name for the `AudioInput`. Default: `input-n`.

### Changed
- Removed volume limit.
- Updated examples (resume mixer manually on versions older than 17.5.0).
- Lowered required Node.js version from `18.0.0` to `15.0.0`

### Fixed
- Incorrect size of silent audio frame.
- Out of bounds in `AudioInput.getData()`.

<!-- === -->

## [2.1.0] - 2024-10-29
### Added
- Float audio support.

### Changed
- None

### Fixed
- Out of bounds in `ChangeChannelsCount`.
- Params order in `AudioUtils`.

<!-- === -->

## [2.0.0] - 2024-09-12
### Added
- Unsigned audio support.
- AudioInput:
  - New option: [correctByteSize](./docs/api/v2/AudioInput.md#new-audioinputinputparams-mixerparams-removefunction) - Corrects audio frame size if it's not aligned to `BitDepth`.

### Changed
- Code performance.

### Fixed
- None

<!-- === -->

## [1.3.7] - 2023-10-20
### Added
- None

### Changed
- None

### Fixed
- AudioMixer:
  - Problem with `highWaterMark`.

<!-- ===  -->

## [1.3.6] - 2023-10-17
### Added
- None

### Changed
- None

### Fixed
- AudioMixer:
  - Problems with mixing audio.
<!-- === -->

## [1.3.5] - 2023-10-16
### Added:
- AudioMixer:
  - New option: [silentDuration](./docs/api/v1/API.md#new-audiomixermixerargs) - Duration of silent audio frame (in ms). Default: `null`.
  - New option: [preProcessData](./docs/api/v1/API.md#new-audiomixermixerargs) - Processes the audio frame before it leaves the `AudioMixer`. Default: `Passes the audio frame unchanged`.
  - [setGenerateSilent](./docs/api/v1/API.md#mixersetgeneratesilentgeneratesilent) - Sets a new value for `generateSilent`.
  - [setSilentDuration](./docs/api/v1/API.md#mixersetsilentdurationsilentduration) - Sets a new value for `silentDuration`.
  - [setPreProcessData](./docs/api/v1/API.md#mixersetpreprocessdatapreprocessdata) - Sets a new value for `preProcessData`.

### Changed
- AudioMixer:
  - Check if `AudioMixer` is paused ([Readable.isPaused()](https://nodejs.org/api/stream.html#readableispaused)).
  - Emit `mixer.on('end')` after closing the `AudioMixer`.
- AudioInput:
  - Check if `AudioInput` is corked ([Writable.writableCorked](https://nodejs.org/api/stream.html#writablewritablecorked)).

### Fixed
- None

<!-- === -->

## [1.2.4] - 2023-10-06
### Added
- AudioMixer:
  - New option: [generateSilent](./docs/api/v1/API.md#new-audiomixermixerargs) - Generates silent audio frames when there are no `AudioInputs` or they are empty.
  - [getOptions](./docs/api/v1/API.md#mixergetoptions) - Returns a copy of the `AudioMixer` args.
  - [setHighWaterMark](./docs/api/v1/API.md#mixersethighwatermarkhighwatermark) - Sets a new value for `highWaterMark`.
  - [setAutoClose](./docs/api/v1/API.md#mixersetautocloseautoclose) - Sets a new value for `autoClose`.
  - [setDelayTime](./docs/api/v1/API.md#mixersetdelaytimedelaytime) - Sets a new value for `delayTime`.
- AudioInput:
  - [getOptions](./docs/api/v1/API.md#inputgetoptions) - Returns a copy of the `AudioInput` args.
  - [setForceClose](./docs/api/v1/API.md#inputsetforcecloseforceclose) - Sets a new value for `forceClose`.

### Changed
- AudioInput:
  - `availableAudioLength` is removed.

### Fixed
- None

<!-- === -->

## [1.1.3] - 2023-09-30
### Added
- None

### Changed
- None

### Fixed
- Export `AudioTypes` definitions.

<!-- === -->

## [1.1.2] - 2023-09-29
### Added
- AudioInput:
  - New option: [forceClose](./docs/api/v1/API.md#mixercreateaudioinputinputargs) - clears buffer immediately after closing `AudioInput`.

### Changed
- None

### Fixed
- None

<!-- === -->

## [1.0.1] - 2023-09-21
### Added
- None

### Changed
- None

### Fixed
- Add field "files" to package.json to specify npm package contents.

<!-- === -->

## [1.0.0] - 2023-09-20
### Added
- First release.

### Changed
- None

### Fixed
- None
