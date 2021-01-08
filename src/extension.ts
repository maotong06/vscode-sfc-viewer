import { VueViewer } from './commands/vue-viewer';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
let child = {} as cp.ChildProcess

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let vueViewer = new VueViewer(context)

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-sfc-viewer" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand(
		'extension.vscode-sfc-viewer.vue2Viewer',
		async (fileUrl) => {
			await vueViewer.openViewer(fileUrl)
		}
	));
	context.subscriptions.push(vscode.commands.registerCommand(
		'extension.vscode-sfc-viewer.killViewer',
		() => {
			vueViewer.closeViewer()
		}
	));
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (child && child.kill) {
		child.kill()
	}
}
