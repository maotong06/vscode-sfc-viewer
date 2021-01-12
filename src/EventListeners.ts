import { StatusbarUi } from './statusUI';
import { TextDocument } from 'vscode'
import * as cmd from './const/commends'

export function onDidOpenTextDocument(document: TextDocument) {
  StatusbarUi.show()
}