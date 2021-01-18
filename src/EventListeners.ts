import { StatusbarUi } from './StatusUI';
import { TextDocument } from 'vscode'
import * as cmd from './const/commends'

export function statusbarUiShow(document: TextDocument) {
  StatusbarUi.show()
}