// 修改入口vue文件，保证css的同时，注入对应标签
const compiler = require('vue-template-compiler')
const config = require('../config.js')

module.exports = function (source, map) {
  // console.log('source', this.resourcePath, config.targetSFCPath)
  // 跳过对自身的替换
  if (this.resourcePath === config.targetSFCPath) {
    this.callback(
      null,
      newSourse,
      map
    )
    return 
  }
  // console.log('compiler', compiler)
  // console.log('parsed', compiler.compile(source, { outputSourceRange: true }))
  const templateInfo = compiler.parseComponent(source, {deindent: false}).template
  const tempCompileInfo = compiler.compile(templateInfo.content, { outputSourceRange: true })
  // console.log('templateInfo', templateInfo.content.match(/^\s+/))
  // console.log('compileTemp', tempCompileInfo)
  let templateStartBlackLength = templateInfo.content.match(/^\s+/) ? templateInfo.content.match(/^\s+/)[0].length : 0
  let templateEndBlackLength = templateInfo.content.match(/\s+$/) ? templateInfo.content.match(/\s+$/)[0].length : 0
  let start = templateInfo.start + templateStartBlackLength
  let end = templateInfo.end - templateEndBlackLength
  if (tempCompileInfo.ast.children.length >= 1) {
    // 找到子element中开始和结束为止
    let tempStart = Infinity
    tempCompileInfo.ast.children.forEach(ele => {
      if (ele.start < tempStart) {
        tempStart = ele.start
        tagName = ele.tag
      }
    })
    start = start + tempStart
  } else {
    throw new Error()
  }
  const startStr = source.slice(0, start)
  const endStr = source.slice(end)
  const newSourse = `${startStr}
<${config.sfcTagName} />
<${config.devComponentTag} />
</${tempCompileInfo.ast.tag}>
${endStr}
  `
  // throw new Error('停止')

  this.callback(
      null,
      newSourse,
      map
  )
}