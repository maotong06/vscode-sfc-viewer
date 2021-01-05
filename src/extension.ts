// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
let child = {} as cp.ChildProcess

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-sfc-viewer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.vscode-sfc-viewer.vue2Viewer', async (fileUri) => {
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
		let serviceDirName = 'vue-2-js';
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
		const configContent = Buffer.from(`module.exports = {
			"sfcTagName": "VscodeSfcViewer",
			"targetSFCPath": "${sfcFileFsPath}",
			"devComponentPath": "${devComponentPath}",
			"devComponentTag": "devComp",
			"vueVersion": "${targetPackageJson.dependencies.vue ?
				targetPackageJson.dependencies.vue : targetPackageJson.devDependencies.vue ?
				targetPackageJson.devDependencies.vue: 2}",
			"isTs": ${targetPackageJson.dependencies.typescript ?
				'true': targetPackageJson.devDependencies.typescript ?
				'true': 'false'}
		}`, 'utf8') 
		console.log(configContent)
		await vscode.workspace.fs.writeFile(configFileUrl, configContent);

		child = cp.execFile(
			'node',
			[`${targetServiceDirPath}/bin/vue-cli-service.js`, 'serve', '--open'],
			{ cwd: vscode.workspace.workspaceFolders[0].uri.fsPath },
			(error: any, stdout: any, stderr: any) => {
				if (error) {
					throw error;
				}
				console.log(stdout);
			}
		);
		// 监听子进程
		if (child && child.stdout) {
		child.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});
		}
		if (child && child.stderr) {
			child.stderr.on('data', (data) => {
				console.error(`stderr: ${data}`);
			});
		}
		child.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (child && child.kill) {
		child.kill()
	}
}
