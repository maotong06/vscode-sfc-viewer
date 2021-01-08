import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path'

export abstract class SuperViewer {
  protected abstract matchLanguageIds: string[]
  protected abstract serviceDirName: string
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
    if (this.child.kill) {
      this.child.kill(0)
      console.log('已关闭进程')
    }
  }

  protected runProcess(execArgs: string[]) {
    if (!vscode.workspace.workspaceFolders) {
      return
    }
    if (this.child.kill) {
      this.child.kill()
      console.log('已关闭进程')
      this.child = {} as cp.ChildProcess
    }
    this.child = cp.execFile(
      'node',
      execArgs,
      { cwd: vscode.workspace.workspaceFolders[0].uri.fsPath },
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          throw error;
        }
        console.log(stdout);
      }
    );
    // 监听子进程
    if (this.child && this.child.stdout) {
    this.child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
    }
    if (this.child && this.child.stderr) {
      this.child.stderr.on('data', (data) => {
        if (data.indexOf('webpack.Progress') < 0) {
          console.error(`stderr: ${data}`);
        }
      });
    }
    this.child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }

  protected initWorkspaceUri(fileUri: vscode.Uri) {
    if (!(vscode.workspace && vscode.workspace.workspaceFolders)) {
      throw new Error('未找到工作区文件夹')
    }
    if (fileUri) {
      this.sfcFileFsPath = fileUri.fsPath
    } else if (vscode.window.activeTextEditor?.document.languageId && this.matchLanguageIds.includes(vscode.window.activeTextEditor?.document.languageId)) {
      this.sfcFileFsPath = vscode.window.activeTextEditor?.document.fileName
    } else {
      throw new Error('当前没有打开或指定文件')
    }

    this.workspaceFoldersUri = vscode.workspace.workspaceFolders[0].uri
    this.originServiceDir = vscode.Uri.parse(path.join(this.context.extensionPath, 'src', 'service', this.serviceDirName));
    this.targetServiceDir = vscode.Uri.joinPath( this.workspaceFoldersUri, 'node_modules', this.serviceDirName);
  }
}
