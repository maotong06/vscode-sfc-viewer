import { Config } from './../Config';
import { StatusbarUi } from '../StatusUI';
import { Logger } from '../Logger';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path'

export abstract class SuperViewer {
  protected abstract matchLanguageIds: string[]
  protected abstract serviceDirName: string
  protected abstract nodeModuleDirName: string
  protected child = {} as cp.ChildProcess
  protected sfcFileFsPath: string = ''
  protected context: vscode.ExtensionContext
  protected originServiceDir: vscode.Uri = {} as vscode.Uri
  protected targetServiceDir: vscode.Uri = {} as vscode.Uri
  protected workspaceFoldersUri: vscode.Uri = {} as vscode.Uri

  public constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public abstract openViewer(fileUri: vscode.Uri): any

  public closeViewer() {
    StatusbarUi.changeOpening(false)
    if (this.child.kill) {
      this.child.send({ code: 'close' })
      this.child.kill()
      Logger.log('已关闭进程')
    }
  }

  protected runProcess(moudulePath: string, execArgs: string[]) {
    if (!vscode.workspace.workspaceFolders) {
      return
    }
    this.closeViewer()
    console.log('Config.getRunArgs()', Config.getRunArgs())
    StatusbarUi.changeOpening(true)
    this.child = cp.fork(
      moudulePath,
      execArgs.concat(Config.getRunArgs()),
      {
        cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
        silent: true
      },
    );
    this.child.on('message', (msg) => {
      Logger.log(msg)
    })
    // 监听子进程
    if (this.child && this.child.stdout) {
    this.child.stdout.on('data', (data) => {
        Logger.log(data);
      });
    }
    if (this.child && this.child.stderr) {
      this.child.stderr.on('data', (data) => {
        if (data.indexOf('webpack.Progress') < 0) {
          Logger.log(data);
        }
      });
    }
    this.child.on('close', (code) => {
      StatusbarUi.changeOpening(false)
      Logger.log(`child process exited with code ${code}`);
    });
  }

  protected initWorkspaceUri(fileUri: vscode.Uri) {
    if (!(vscode.workspace && vscode.workspace.workspaceFolders)) {
      vscode.window.showInformationMessage('Workspace not opened')
      throw new Error()
    }
    if (fileUri) {
      this.sfcFileFsPath = fileUri.fsPath
    } else if (vscode.window.activeTextEditor?.document.languageId && this.matchLanguageIds.includes(vscode.window.activeTextEditor?.document.languageId)) {
      this.sfcFileFsPath = vscode.window.activeTextEditor?.document.fileName
    } else {
      vscode.window.showInformationMessage('The specified file is not currently open')
      throw new Error()
    }

    this.workspaceFoldersUri = vscode.workspace.workspaceFolders[0].uri
    this.originServiceDir = vscode.Uri.parse(path.join(this.context.extensionPath, 'src', 'service', this.serviceDirName));
    this.targetServiceDir = vscode.Uri.joinPath( this.workspaceFoldersUri, 'node_modules', this.nodeModuleDirName, this.serviceDirName);
  }
}
