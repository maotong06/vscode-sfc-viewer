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
	let disposable = vscode.commands.registerCommand('vscode-sfc-viewer.helloWorld', async () => {
		if (!(vscode.workspace && vscode.workspace.workspaceFolders)) {
			throw new Error('未找到工作区文件夹')
		}
		let serviceDirName = 'vue-2-js';
		const originServiceDir = vscode.Uri.parse(path.join(context.extensionPath, 'src', 'service', serviceDirName));
		const targetServiceDir = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', serviceDirName);
		const targetServiceDirPath = targetServiceDir.fsPath;
		// 复制启动文件
		await vscode.workspace.fs.copy(originServiceDir, targetServiceDir, { overwrite: true })

		child = cp.execFile(
			'node',
			[`${targetServiceDirPath}/bin/vue-cli-service.js`, 'serve'],
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
