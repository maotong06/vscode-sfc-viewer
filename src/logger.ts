import { ExtensionContext, ExtensionMode, OutputChannel, Uri, window } from 'vscode';

export class Logger {
  static extensionOutputChannelName = 'sfc viwer'
  private output: OutputChannel | undefined;
  constructor() {
    this.output = this.output ? this.output : window.createOutputChannel(Logger.extensionOutputChannelName)
  }
  log(val: string) {
    console.log('logger log', val)
    this.output?.appendLine(String(val))
  }
  show() {
    this.output?.show()
  }
  clear() {
    this.output?.clear()
  }
}