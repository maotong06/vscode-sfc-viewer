const compiler = require('vue-template-compiler')

module.exports = function (source, map) {
  // console.log('source', this.resourcePath, this, source)
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
    let tempEnd = -1
    tempCompileInfo.ast.children.forEach(ele => {
      if (ele.start < tempStart) {
        tempStart = ele.start
      }
      if (ele.end > tempEnd) {
        tempEnd = ele.end
      }
    })
    start = start + tempStart
    end = end - (tempCompileInfo.ast.end - tempEnd)
  } else {
    throw new Error()
  }
  const startStr = source.slice(0, start)
  const endStr = source.slice(end)
  // console.log('slice', startStr,  endStr)
  // throw new Error('停止')

  this.callback(
      null,
      source,
      map
  )
}