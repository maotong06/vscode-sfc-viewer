import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { SuperViewer } from './super-viewer';
import { templateRender } from '../utils/templateRender';


export class VueViewer extends SuperViewer {
  protected serviceDirName = 'react-scripts-4'
  protected matchLanguageIds = ['jsx', 'javascriptreact', 'typescriptreact']

  public constructor(context: vscode.ExtensionContext) {
    super(context)
  }
  
  public async openViewer(fileUri: vscode.Uri) {
    await this.initWorkspaceUri(fileUri)
    await this.writeFiles()
    this.runProcess([path.join(this.targetServiceDir.fsPath, 'bin', 'react-scripts.js'), 'start'])
  }

  private async writeFiles() {
    // 复制启动文件
    await vscode.workspace.fs.copy(this.originServiceDir, this.targetServiceDir, { overwrite: true })
  
    // 写入config.js
    const originConfigFileUrl = vscode.Uri.joinPath(this.targetServiceDir, 'run-time-script', 'config')
    const targetConfigFileUrl = vscode.Uri.joinPath(this.targetServiceDir, 'run-time-script', 'config.js')
    const devComponentPath = vscode.Uri.joinPath(this.targetServiceDir, 'run-time-script', 'components', 'devComp', 'devComp.vue').fsPath
    const targetPackageJson = JSON.parse((await vscode.workspace.fs.readFile(vscode.Uri.joinPath(this.workspaceFoldersUri, 'package.json'))).toString())
    console.log('targetPackageJson', targetPackageJson)
    let originConfigStr = await (await vscode.workspace.fs.readFile(originConfigFileUrl)).toString()
    const configContent = Buffer.from(
      templateRender(originConfigStr, {
        sfcFileFsPath: this.sfcFileFsPath,
        devComponentPath,
        isTs: targetPackageJson.dependencies.typescript ?
        'true': targetPackageJson.devDependencies.typescript ?
        'true': 'false'})
      , 'utf8') 
    console.log(configContent)
    await vscode.workspace.fs.writeFile(targetConfigFileUrl, configContent);
  }

}
