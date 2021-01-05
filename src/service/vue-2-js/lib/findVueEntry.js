const babelParser = require("@babel/parser")
const path = require('path')
const fs = require('fs')
const get = require('./util/get.js')

module.exports = function (mainjsEntryPath) {
  let jsEntryAbsolutePath = path.join(process.cwd(), mainjsEntryPath)
  let source = fs.readFileSync(jsEntryAbsolutePath).toString('utf-8')
  let sourseParse = babelParser.parse(source, { sourceType: "module" })
  // console.log('sourseParse', sourseParse.program.body)
  let vueEntrys = []
  let astBody = sourseParse.program.body
  astBody.forEach(ast => {
    if (ast.type === 'ImportDeclaration') {
      if (ast.source.value.endsWith('.vue')) {
        vueEntrys.push(ast.source.value)
      }
    } else if (ast.type === 'VariableDeclaration') {
      ast.declarations.forEach(declaration => {
        if (declaration.type === 'VariableDeclarator') {
          if (get(declaration, ['init', 'callee', 'name']) === 'require') {
            let value = get(declaration, ['init', 'arguments', 0, 'value'], '')
            if (get(declaration, ['init', 'arguments', 0, 'type']) === 'StringLiteral' && value.endsWith('.vue')) {
              vueEntrys.push(value)
            }
          }
        }
      })
    }
  })
  return vueEntrys
}
