import * as cp from 'child_process';
import * as vscode from 'vscode';

export class SuperViewer {
  public child = {} as cp.ChildProcess
  public execArgs: string[] = []
  

  public closeViewer() {
    if (this.child.kill) {
      this.child.kill()
    }
  }

  public runProcess() {
    if (!vscode.workspace.workspaceFolders) {
      return
    }
    if (this.child.kill) {
      this.child.kill()
      this.child = {} as cp.ChildProcess
    }
    this.child = cp.execFile(
      'node',
      this.execArgs,
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
}
