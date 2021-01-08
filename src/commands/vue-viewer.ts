import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { SuperViewer } from './super-viewer';
import { templateRender } from '../utils/templateRender';


export class VueViewer extends SuperViewer {
  
  public async openViewer(context: vscode.ExtensionContext, fileUri: vscode.Uri) {
    if (!(vscode.workspace && vscode.workspace.workspaceFolders)) {
      throw new Error('未找到工作区文件夹')
    }
    let sfcFileFsPath
    if (fileUri) {
      sfcFileFsPath = fileUri.fsPath
    } else if (vscode.window.activeTextEditor?.document.languageId === 'vue') {
      sfcFileFsPath = vscode.window.activeTextEditor?.document.fileName
    } else {
      throw new Error('当前没有打开或指定vue文件')
    }
    let serviceDirName = 'vue-cli-service';
    const originServiceDir = vscode.Uri.parse(path.join(context.extensionPath, 'src', 'service', serviceDirName));
    const targetServiceDir = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', serviceDirName);
    const targetServiceDirPath = targetServiceDir.fsPath;
  
    // 复制启动文件
    await vscode.workspace.fs.copy(originServiceDir, targetServiceDir, { overwrite: true })
  
    // 写入目标文件地址
    const configFileUrl = vscode.Uri.joinPath(targetServiceDir, 'run-time-script', 'config.js')
    const devComponentPath = vscode.Uri.joinPath(targetServiceDir, 'run-time-script', 'components', 'devComp', 'devComp.vue').fsPath
    const targetPackageJson = JSON.parse((await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'package.json'))).toString())
    console.log('targetPackageJson', targetPackageJson)
    let originConfigStr = await (await vscode.workspace.fs.readFile(configFileUrl)).toString()
    const configContent = Buffer.from(
      templateRender(originConfigStr, {
        sfcFileFsPath,
        devComponentPath,
        vueVersion: targetPackageJson.dependencies.vue ?
        targetPackageJson.dependencies.vue : targetPackageJson.devDependencies.vue ?
        targetPackageJson.devDependencies.vue: 2,
        isTs: targetPackageJson.dependencies.typescript ?
        'true': targetPackageJson.devDependencies.typescript ?
        'true': 'false'})
      , 'utf8') 
    console.log(configContent)
    await vscode.workspace.fs.writeFile(configFileUrl, configContent);

    this.execArgs = [path.join(targetServiceDirPath, 'bin', 'vue-cli-service.js'), 'serve', '--open']
  
    this.runProcess()
  }
}
