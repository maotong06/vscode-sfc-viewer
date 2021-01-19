const config = require('../../config.js')
const get = require('../../get.js')


module.exports = function mainTsParse(source) {
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