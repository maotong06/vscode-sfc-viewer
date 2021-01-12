import { workspace } from 'vscode';

export class Config {
  public static get configuration() {
    return workspace.getConfiguration('SFCViewer.setting')
  }

  private static getSettings<T>(val: string): T {
    return Config.configuration.get(val) as T;
  }

  private static setSettings(key: string, val: number, isGlobal: boolean = false): Thenable<void> {
    return Config.configuration.update(key, val, isGlobal);
  }

  public static getRunArgs(): string[] {
    console.log(workspace.getConfiguration('SFCViewer.setting'))
    return Config.getSettings<string[]>('runArgs');
  }
}