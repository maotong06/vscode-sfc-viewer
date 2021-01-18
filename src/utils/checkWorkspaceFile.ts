import { Uri, workspace, window } from 'vscode';

export async function getUriAndLanguageId(matchLanguageIds: string[], fileUri: Uri): Promise<{ uri: Uri, languageId: string }> {
  if (!(workspace && workspace.workspaceFolders)) {
    window.showInformationMessage('Workspace not opened')
    throw new Error()
  }
  if (fileUri) {
    let textDoc = await workspace.openTextDocument(fileUri)
    return { uri: fileUri, languageId: textDoc.languageId }
  } else if (window.activeTextEditor?.document.languageId && matchLanguageIds.includes(window.activeTextEditor?.document.languageId)) {
    return { uri: window.activeTextEditor?.document.uri, languageId: window.activeTextEditor?.document.languageId }
  } else {
    window.showInformationMessage('The specified file is not currently open')
    throw new Error()
  }
}