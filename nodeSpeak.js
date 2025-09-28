const process = require("process");
const { exec } = require("child_process");

class NodeSpeak {
    constructor(options = {}) {

        this.voice = options.voice || null;
        this.engine = this.detectEngine();
        this.queue = [];
        this.isSpeaking = false;
    }

    detectEngine() {
        const platform = process.platform;

        if (platform === "win32") {
            this.voice = this.voice || "Microsoft David Desktop"; // Default voice
        } else if (platform === "darwin") {
            this.voice = this.voice || "Alex"; // macOS default voice
        }

        return platform;
    }

    getVoices() {
        return new Promise((resolve, reject) => {
            if (this.engine === "win32") {
                const command = `powershell -Command "Add-Type -AssemblyName System.Speech; $voices = New-Object System.Speech.Synthesis.SpeechSynthesizer; $voices.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }"`;

                exec(command, (error, stdout, stderr) => {
                    if (error) return reject(error);
                    if (stderr) return reject(new Error(stderr));

                    const voices = stdout
                        .split(/\r?\n/)
                        .map((v) => v.trim())
                        .filter(Boolean);

                    resolve(voices);
                });
            } else if (this.engine === "darwin") {
                exec('say -v "?"', (error, stdout, stderr) => {
                    if (error) return reject(error);
                    if (stderr) return reject(new Error(stderr));

                    const voices = stdout
                        .split(/\r?\n/)
                        .map((line) => line.trim().split(/\s{2,}/)[0]) // Extract voice name
                        .filter(Boolean);

                    resolve(voices);
                });
            } else {
                reject(new Error("TTS not supported on this OS"));
            }
        });
    }

    async setVoice(voiceName) {
        const voices = await this.getVoices(false);

        if (!voiceName) {
            this.voice = voices[0];
            return;
        }

        if (!voices.includes(voiceName)) {
            throw new Error(
                `Invalid voice: "${voiceName}". Available voices: ${voices.join(", ")}`
            );
        }

        this.voice = voiceName;
        console.log(`Voice set to: ${this.voice}`);
    }

    // Public function
    speakNow(text) {
        this.queue.push(text);
        this.processQueue();
    }

    async processQueue() {
        if (this.isSpeaking || this.queue.length === 0) return;

        this.isSpeaking = true;
        const text = this.queue.shift();

        const escapedText = text.replace(/"/g, '\\"');
        let command = "";

        if (this.engine === "win32") {
            const voicePart = this.voice
                ? `$speak.SelectVoice(\\"${this.voice}\\"); `
                : "";

            command = `powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; ${voicePart}$speak.Speak(\\"${escapedText}\\")"`;
        } else if (this.engine === "darwin") {
            command = `say ${this.voice ? `-v "${this.voice}" ` : ""}"${escapedText}"`;
        } else {
            console.error("Package not supported on this platform.");
            this.isSpeaking = false;
            return;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) console.error(`Speak error: ${error.message}`);
            if (stderr) console.error(`Speak warning: ${stderr}`);

            this.isSpeaking = false;
            this.processQueue(); // Continue with next item
        });
    }
}

module.exports = NodeSpeak;
