Node.js Audio Mixer
============

[![Npm packet](https://img.shields.io/npm/v/node-audio-mixer.svg?logo=npm)](https://www.npmjs.com/package/node-audio-mixer)

## About

Audio mixer that allows mixing PCM audio streams with customizable parameters.

## Installation

**Node.js 12.2.0 or newer is required.**

**npm:**
```bash
npm install node-audio-mixer
```
**pnpm:**
```bash
pnpm install node-audio-mixer
```
**yarn:**
```bash
yarn install node-audio-mixer
```

## Example usage

```javascript
import { createReadStream, createWriteStream } from "fs";
import { AudioMixer } from "node-audio-mixer";

const mixer = new AudioMixer({ sampleRate: 48000, bitDepth: 16, channels: 2, autoClose: true });

const outputAudio = createWriteStream("mixed.pcm");

const audio1 = createReadStream("audio1.pcm");
const audio2 = createReadStream("audio2.pcm");

const input1 = mixer.createAudioInput({ sampleRate: 44100, bitDepth: 16, channels: 1 });
const input2 = mixer.createAudioInput({ sampleRate: 44100, bitDepth: 16, channels: 1 });

mixer.pipe(outputAudio);

audio1.pipe(input1);
audio2.pipe(input2);
```

<font size=3> More examples you can find in **[examples](https://github.com/AlexPl3331/node-audio-mixer/tree/main/examples)** </font>

## API Documentation
<font size=3> You can find in **[/docs/API.md](https://github.com/AlexPl3331/node-audio-mixer/blob/main/docs/API.md)** </font>

## Changelog

<font size=3> You can view the changelogs on **[GitHub releases](https://github.com/AlexPl3331/node-audio-mixer/releases)** </font>

## License

[MIT](https://github.com/AlexPl3331/node-audio-mixer/blob/main/LICENSE)