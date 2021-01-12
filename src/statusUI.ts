import { StatusBarItem, window, StatusBarAlignment } from 'vscode';
import * as cmd from './const/commends'

export class StatusbarUi {
  private static _statusBarItem: StatusBarItem;
  private static _isOpening: boolean = false
  private static _closeCmd: string = ''

  private static get statusbar() {
    if (!StatusbarUi._statusBarItem) {
        StatusbarUi._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);

        this.statusbar.show();
    }

    return StatusbarUi._statusBarItem;
  }

  public static changeOpening(val: boolean) {
    StatusbarUi._isOpening = val
    StatusbarUi.show()
  }

  public static show() {
    if (StatusbarUi._isOpening) {
      StatusbarUi.showCloseSfc()
    } else {
      StatusbarUi.showOpenSfc()
    }
  }

  // public static hidden() {
  //   if (StatusbarUi._isOpening) {
  //     return
  //   } else {
  //     StatusbarUi.statusbar.hide()
  //   }
  // }

  private static showOpenSfc() {
    console.log('window.activeTextEditor?.document.languageId', window.activeTextEditor?.document.languageId)
    if (window.activeTextEditor?.document.languageId) {

      switch (window.activeTextEditor?.document.languageId) {
        case 'vue':
          StatusbarUi.statusbar.text = '$(radio-tower)Open sfc'
          StatusbarUi.statusbar.command = cmd.VUE_OPEN
          StatusbarUi.statusbar.tooltip = 'Click to open sfc'
          StatusbarUi._closeCmd = cmd.VUE_CLOSE
          StatusbarUi.statusbar.show()
          break;
        case 'javascriptreact':
        case 'typescriptreact':
          StatusbarUi.statusbar.text = '$(radio-tower)Open sfc'
          StatusbarUi.statusbar.command = cmd.REACT_OPEN
          StatusbarUi.statusbar.tooltip = 'Click to open sfc'
          StatusbarUi._closeCmd = cmd.REACT_CLOSE
          StatusbarUi.statusbar.show()
          break;
        default:
          // StatusbarUi.hidden()
          break;
      }
    } else {
      // StatusbarUi.hidden()
    }
    
  }

  private static showCloseSfc() {
    StatusbarUi.statusbar.text = '$(remove-close)Close sfc'
    StatusbarUi.statusbar.command = StatusbarUi._closeCmd
    StatusbarUi.statusbar.tooltip = 'Click to close sfc'
    StatusbarUi.statusbar.show()
  }
}