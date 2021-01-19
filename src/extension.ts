import { StatusbarUi } from './StatusUI';
import { Logger } from './Logger';
import { ReactViewer } from './commands/react-viewer';
import { VueViewer } from './commands/vue-viewer';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as cmd from './const/commends';
import { statusbarUiShow } from './EventListeners';
import { getUriAndLanguageId } from './utils/checkWorkspaceFile';
let viewers = [ReactViewer, VueViewer]
let viewerInsitents: ReactViewer | VueViewer

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	Logger.log('Congratulations, your extension "vscode-sfc-viewer" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand(
		cmd.SFC_OPEN,
		async (fileUri) => {
			const matchLanguageIds = viewers.reduce((preVal, currentVal) => {
				return preVal.concat(currentVal.matchLanguageIds)
			}, [] as string[])
			const { uri, languageId } = await getUriAndLanguageId(matchLanguageIds, fileUri)

			for (const viewer of viewers) {
				if (viewer.matchLanguageIds.includes(languageId)) {
					viewerInsitents = new viewer(context)
					Logger.show()
					viewerInsitents.openViewer(uri)
					return
				}
			}
		}
	));
	context.subscriptions.push(vscode.commands.registerCommand(
		cmd.SFC_CLOSE,
		() => {
			viewerInsitents.closeViewer()
		}
	));
	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(statusbarUiShow))
}

// this method is called when your extension is deactivated
export function deactivate() {
	viewerInsitents.closeViewer()
}
