declare module "node-speak" {
    export class NodeSpeak {
        constructor(options?: { voice?: string });
        setVoice(voiceName: string): Promise<void>;
        getVoices(showLog?: boolean): Promise<string[]>;
        speakNow(text: string): void;
    }
}
