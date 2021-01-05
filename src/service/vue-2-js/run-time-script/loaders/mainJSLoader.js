// 修改 main.js 入口文件，注册目标vue sfc组件
const get = require('../../lib/util/get.js')
const config = require('../config.js')
let parse
if (config.isTs) {
  parse = require("typescript")
} else {
  parse = require("@babel/parser")
}
// console.log('config', config)
module.exports = function (source, map) {
  console.log('MainLoader Start')
  try {
    let vueVariableName, vueVeriableEndPosition
    if (config.isTs) {
      res = mainTsParse(source)
      vueVariableName = res.vueVariableName
      vueVeriableEndPosition = res.vueVeriableEndPosition
    } else {
      res = mainJsParse(source)
      vueVariableName = res.vueVariableName
      vueVeriableEndPosition = res.vueVeriableEndPosition
    }

    if (!vueVariableName) {
      console.error('未找到vue定义代码')
    }
    // 插入vue组件
    const startStr = source.slice(0, vueVeriableEndPosition)
    const endStr = source.slice(vueVeriableEndPosition)
    const newSourse = `${startStr}
;${vueVariableName}.component('${config.sfcTagName}', ()=> import('${config.targetSFCPath}')) // eslint-disable-line
;${vueVariableName}.component('${config.devComponentTag}', ()=> import('${config.devComponentPath}')) // eslint-disable-line
${endStr}`

    this.callback(
      null,
      newSourse,
      map
    )
  } catch (error) {
    console.error(error)
  }

}

function mainTsParse(source) {
  const ts = require('typescript')
  let vueVariableName = ''
  let vueVeriableEndPosition = 0

  let sourseParse = ts.createSourceFile('main.ts', source, ts.ScriptTarget.Latest, true);
  // console.log('sourseParse', sourseParse)
  let astBody = sourseParse.statements

  astBody.forEach(ast => {
    if (ast.kind === ts.SyntaxKind.ImportDeclaration) {
      if (ast.moduleSpecifier.text === 'vue') {
        vueVariableName = ast.importClause.name.escapedText
        vueVeriableEndPosition = ast.end
      }
    } else if (ast.kind === ts.SyntaxKind.VariableStatement) {
      ast.declarationList.declarations.forEach(declaration => {
        if (get(declaration, ['initializer', 'kind']) === ts.SyntaxKind.CallExpression &&
        get(declaration, ['initializer', 'expression', 'escapedText']) === 'require' &&
        get(declaration, ['initializer', 'arguments', 0, 'text']) === 'vue'
          ) {
          vueVariableName = declaration.name.escapedText
          vueVeriableEndPosition = ast.end
        }
      })
    }
  })
  return {
    vueVariableName,
    vueVeriableEndPosition
  }
}

function mainJsParse(source) {
  // 查找vue变量名
  let vueVariableName = ''
  let vueVeriableEndPosition = 0

  let sourseParse = parse.parse(source, { sourceType: "module" })
  // console.log('sourseParse', sourseParse.program.body)
  let astBody = sourseParse.program.body

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

  return {
    vueVariableName,
    vueVeriableEndPosition
  }
}
