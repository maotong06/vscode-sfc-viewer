// 修改 main.js 入口文件，注册目标vue sfc组件
const babelParser = require("@babel/parser")
const get = require('../../lib/util/get.js')
const config = require('../config.js')
console.log('config', config)
module.exports = function (source, map) {
  console.log('MainLoader Start')
  try {
    let sourseParse = babelParser.parse(source, { sourceType: "module" })
    // console.log('sourseParse', sourseParse.program.body)
    let astBody = sourseParse.program.body

    // !!! 目前只考虑在root上的vue实例化，暂不考虑在代码块内的vue实例化
    // !!! 目前只考虑实例化一次的情况

    // 查找vue变量名
    let vueVariableName = ''
    let vueVeriableEndPosition = 0
    astBody.forEach(ast => {
      if (ast.type === 'ImportDeclaration') {
        if (ast.source.value === 'vue') {
          vueVariableName = ast.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier').local.name
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
    if (!vueVariableName) {
      console.error('未找到vue定义代码')
    }
    // 插入vue组件
    const startStr = source.slice(0, vueVeriableEndPosition)
    const endStr = source.slice(vueVeriableEndPosition)
    const newSourse = `${startStr}
;Vue.component('${config.sfcTagName}', ()=> import('${config.targetSFCPath}')) // eslint-disable-line
;Vue.component('${config.devComponentTag}', ()=> import('${config.devComponentPath}')) // eslint-disable-line
${endStr}`

    // TODO: 查找入口app.vue path



    this.callback(
      null,
      newSourse,
      map
    )
  } catch (error) {
    console.error(error)
  }

}
