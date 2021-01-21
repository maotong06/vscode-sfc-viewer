# vscode-sfc-viewer README

This plugin is used to preview vue, react single file components with one click

## Features

In .vue, .jsx, .tsx, right click and select View sfc, this will start a server, open webapackdev in your project.

#### commands
* `View sfc`: open the sfc file
* `Kill sfc`: close the sfc server

#### keybindings: 

`alt+K alt+F` or `cmd+K cmd+F`: open the sfc file
`alt+K alt+P` or `cmd+K cmd+P`: close the sfc server

![Open React](https://vps-1253210315.cos.ap-shanghai.myqcloud.com/videoedit/qimeng/49cuxiao/202001113/open_react.gif)

![Open Vue](https://vps-1253210315.cos.ap-shanghai.myqcloud.com/videoedit/qimeng/49cuxiao/202001113/open_vue.gif)

## Requirements

This depends on the startup scaffolding of your project, in vue it needs `@vue/cli-server`, in react it needs `react-scripts` installed in your project, it will modify your webpack configuration.

It will modify your webpack configuration so that the home page opens to the corresponding single file component.

## Extension Settings

* `SFCViewer.setting.runArgs`: Set your project running arg on starts, like `['--mode', 'development']`  in vue cli after `npm run serve`, default is `[]`,

## Known Issues
* Tip: If there is node-sass in the project, there may be incompatibility, because node-sass will detect the node version, and the node in vscode is not in the compatibility list.

* Q: Can it automatically complete authentication or automatically skip authentication？
* A: No, it will not automatically complete the authentication. If there is authentication on your program or routing hook, it will not automatically skip, and it will still retain this authentication. You need to pay attention to this.

* Q: Why can't my sfc program start
* A: Because the version of @vue/cli-server or react-scirpts that this plug-in depends on is strongly related, if your project was created too long ago, it may not start. But the error message should be displayed on the output panel, please tell me the detailed information so that I can deal with it

* Q: About webpack multi-entry project
* A: It will start the project normally, but you need to manually enter one of the entries in the browser to see the sfc component. For example: http://localhost:8080/some.html

## Release Notes

### 1.0.1
Complete the startup of the vue react project components

-----------------------------------------------------------------------------------------------------------
## LICENSE
This extension is licensed under the MIT License