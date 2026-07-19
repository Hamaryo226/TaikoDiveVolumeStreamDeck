import {
  action,
  type DialDownEvent,
  type DialRotateEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent
} from "@elgato/streamdeck";

type VolumeTarget = "master" | "music" | "sound-effect";
type StatusKey = "master" | "music" | "soundEffect";

type VolumeStatus = {
  master: number;
  music: number;
  soundEffect: number;
};

const apiBaseUrl = "http://127.0.0.1:24727";

abstract class VolumeDialAction extends SingletonAction {
  private readonly visibleActions = new Set<any>();
  private pollTimer?: ReturnType<typeof setInterval>;
  private currentValue = 100;
  private connected = false;

  protected constructor(
    private readonly target: VolumeTarget,
    private readonly statusKey: StatusKey,
    private readonly label: string
  ) {
    super();
  }

  override onWillAppear(ev: WillAppearEvent): void {
    if (!ev.action.isDial())
      return;
    this.visibleActions.add(ev.action);
    void this.refreshAll();
    if (this.pollTimer === undefined)
      this.pollTimer = setInterval(() => void this.refreshAll(), 500);
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    this.visibleActions.delete(ev.action);
    if (this.visibleActions.size === 0 && this.pollTimer !== undefined) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  override async onDialRotate(ev: DialRotateEvent): Promise<void> {
    const delta = ev.payload.ticks * 5;
    this.currentValue = Math.max(0, Math.min(100, this.currentValue + delta));
    await this.updateFeedback(ev.action, this.currentValue, true);
    try {
      await fetch(`${apiBaseUrl}/volume/${this.target}?delta=${delta}`, { method: "POST" });
      this.connected = true;
      setTimeout(() => void this.refreshAll(), 50);
    }
    catch {
      this.connected = false;
      await ev.action.showAlert();
      await this.updateFeedback(ev.action, this.currentValue, false);
    }
  }

  override async onDialDown(ev: DialDownEvent): Promise<void> {
    this.currentValue = 100;
    await this.updateFeedback(ev.action, this.currentValue, true);
    try {
      await fetch(`${apiBaseUrl}/volume/${this.target}?value=100`, { method: "POST" });
      this.connected = true;
      setTimeout(() => void this.refreshAll(), 50);
    }
    catch {
      this.connected = false;
      await ev.action.showAlert();
      await this.updateFeedback(ev.action, this.currentValue, false);
    }
  }

  private async refreshAll(): Promise<void> {
    try {
      const response = await fetch(`${apiBaseUrl}/volume`);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
      const status = await response.json() as VolumeStatus;
      this.currentValue = Math.max(0, Math.min(100, status[this.statusKey]));
      this.connected = true;
    }
    catch {
      this.connected = false;
    }

    await Promise.all(Array.from(this.visibleActions, actionInstance =>
      this.updateFeedback(actionInstance, this.currentValue, this.connected)));
  }

  private updateFeedback(actionInstance: any, value: number, connected: boolean): Promise<void> {
    return actionInstance.setFeedback({
      title: this.label,
      value: connected ? `${value}%` : "--"
    });
  }
}

@action({ UUID: "com.hama.taikodive-volume.master" })
export class MasterVolumeAction extends VolumeDialAction {
  constructor() {
    super("master", "master", "マスター");
  }
}

@action({ UUID: "com.hama.taikodive-volume.music" })
export class MusicVolumeAction extends VolumeDialAction {
  constructor() {
    super("music", "music", "楽曲");
  }
}

@action({ UUID: "com.hama.taikodive-volume.sound-effect" })
export class SoundEffectVolumeAction extends VolumeDialAction {
  constructor() {
    super("sound-effect", "soundEffect", "SE");
  }
}
