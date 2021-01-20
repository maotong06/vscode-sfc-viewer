import { ExtensionContext, ExtensionMode, OutputChannel, Uri, window } from 'vscode';

export class Logger {
  static extensionOutputChannelName = 'sfc viwer'
  private static _output: OutputChannel | undefined;

  private static get outputChannal(): OutputChannel {
    if (!Logger._output) {
      Logger._output = window.createOutputChannel(Logger.extensionOutputChannelName)
    }

    return Logger._output;
  }
  public static log(val: string) {
    console.log('logger log', String(val))
    Logger.outputChannal.appendLine(String(val))
  }
  public static show() {
    Logger.outputChannal.show()
  }
  public static clear() {
    Logger.outputChannal.clear()
  }
}