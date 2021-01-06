const config = require('../../config.js')
const get = require('../../../lib/util/get.js')


module.exports = function mainJsVue2(source) {
  parse = require("@babel/parser")
  // 查找vue变量名
  let vueVariableName = ''
  let vueVeriableEndPosition = 0

  let sourseParse = parse.parse(source, { sourceType: "module" })
  // console.log('sourseParse', sourseParse.program.body)
  let astBody = sourseParse.program.body

  astBody.forEach(ast => {
    if (ast.type === 'ImportDeclaration') {
      if (ast.source.value === 'vue') {
        let defaultSpecifier = ast.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier')
        vueVariableName = defaultSpecifier ? defaultSpecifier.local.name : ''
        vueVeriableEndPosition = ast.end
      }
    } else if (ast.type === 'VariableDeclaration') {
      ast.declarations.forEach(declaration => {
        if (declaration.type === 'VariableDeclarator') {
          if (get(declaration, ['init', 'callee', 'name']) === 'require') {
            if (get(declaration, ['init', 'arguments', 0, 'type']) === 'StringLiteral' && get(declaration, ['init', 'arguments', 0, 'value']) === 'vue') {
              vueVariableName = declaration.id.name
              vueVeriableEndPosition = ast.end
            }
          }
        }
      })
    }
  })

  if (vueVeriableEndPosition === 0) {
    console.error('未找到vue定义代码')
  }
  // 插入vue组件
  const startStr = source.slice(0, vueVeriableEndPosition)
  const endStr = source.slice(vueVeriableEndPosition)
  return `${startStr}
;${vueVariableName}.component('${config.sfcTagName}', ()=> import('${config.targetSFCPath}')) // eslint-disable-line
;${vueVariableName}.component('${config.devComponentTag}', ()=> import('${config.devComponentPath}')) // eslint-disable-line
${endStr}`
}