# node-speak

A simple Node.js package for text-to-speech (TTS) using system voices (Windows/macOS).
Supports **sequential speech** so multiple messages don’t overlap.

---

## Installation

```bash
npm install node-speaknow
```

---

## Usage

### JavaScript Example

```js
const NodeSpeak = require("node-speaknow");

(async () => {
  const tts = new NodeSpeak();

  // Get available voices
  const voices = await tts.getVoices();
  console.log("Available voices:", voices);

  // Set a voice (optional, defaults to system default)
  await tts.setVoice("Microsoft Zira Desktop");

  // Speak messages sequentially
  tts.speakNow("Hello world!");
  tts.speakNow("This will play after the first message.");
  tts.speakNow("And this one comes third.");
})();
```

### TypeScript Example

```ts
import NodeSpeak from "node-speak";

(async () => {
  const tts = new NodeSpeak();

  await tts.setVoice("Microsoft Zira Desktop");

  tts.speakNow("Hello from TypeScript!");
})();
```

---

## 🖥️ Supported Platforms

* **Windows** → Uses `System.Speech.Synthesis.SpeechSynthesizer` via PowerShell
* **macOS** → Uses the built-in `say` command
* **Linux** → Not yet supported (planned)

---

## ⚡ Features

* Get available system voices
* Choose a specific voice
* Queue system → prevents overlapping speech
* Works in both **JavaScript** and **TypeScript** projects

---

## 📖 API Reference

### `new NodeSpeak(options?: { voice?: string })`

Creates a new instance of the TTS engine.

| Option | Type   | Default        | Description        |
| ------ | ------ | -------------- | ------------------ |
| voice  | string | system default | Initial voice name |

---

### `getVoices(showLog?: boolean): Promise<string[]>`

Returns a list of available voices.

---

### `setVoice(voiceName: string): Promise<void>`

Sets the active voice. Must match one of the names from `getVoices()`.

---

### `speakNow(text: string): void`

Speaks the given text. If multiple calls are made, they are queued and played one after another.

---

## License

MIT © 2025 Zainul Khan
