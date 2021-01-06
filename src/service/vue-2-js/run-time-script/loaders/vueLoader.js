// 修改入口vue文件，保证css的同时，注入对应标签
const config = require('../config.js')

module.exports = function (source, map) {
  // console.log('source', this.resourcePath, config.targetSFCPath)
  // 跳过对自身的替换
  let newSourse = ''

  if (this.resourcePath === config.targetSFCPath) {
    this.callback(
      null,
      source,
      map
    )
    return 
  }
  // 同一个文件只处理一次
  if (source.indexOf(config.sfcTagName) >= 0) {
    this.callback(
      null,
      source,
      map
    )
    return
  }
  let version = config.vueVersion.match(/\d/)
  if (version && version[0] === '3') {
    newSourse = changeVue3Source(source)
  } else if (version && version[0] === '2') {
    newSourse = changeVue2Source(source)
  }
  // throw new Error('停止')

  this.callback(
      null,
      newSourse,
      map
  )
}

function changeVue2Source(source) {
  const compiler = require('vue-template-compiler')
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
  return `${startStr}
<${config.sfcTagName} />
<${config.devComponentTag} />
</${tempCompileInfo.ast.tag}>
${endStr}`
}

function changeVue3Source(source) {
  const compiler = require('@vue/compiler-sfc')
  let parseSource = compiler.parse(source, { sourceMap: true })
  let template = parseSource.descriptor.template
  let props = []
  let componentsLength = 0
  const start = template.loc.start.offset
  const end = template.loc.end.offset
  template.ast.children.forEach(tag => {
    if (tag.type === 1) {
      props = []
      tag.props && tag.props.forEach(prop => {
        switch (prop.name) {
          case 'id':
          case 'class':
          case 'bind':
            props.push(prop.loc.source)
            break;
          default:
            break;
        }
      })
      componentsLength++
    }
  })
  // 如果根节点只有一个标签，则复制其class， id；否则全部清除替换
  if (componentsLength > 1) {
    props = []
  }

  const startStr = source.slice(0, start)
  const endStr = source.slice(end)

  return `${startStr}
<div ${props.join(' ')}>
<${config.sfcTagName} />
<${config.devComponentTag} />
</div>
${endStr}`
  console.log('parseSource', parseSource, template, props)
}