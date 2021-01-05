
const path = require('path')
const fs = require('fs')
const get = require('../lib/util/get.js')
const config = require('./config.js')
let parse
if (config.isTs) {
  parse = require("typescript")
} else {
  parse = require("@babel/parser")
}

module.exports = function (mainjsEntryPath) {
  let jsEntryAbsolutePath = path.join(process.cwd(), mainjsEntryPath)
  let source = fs.readFileSync(jsEntryAbsolutePath).toString('utf-8')
  if (config.isTs) {
    return findMainTsVueEntry(source)
  } else {
    return findMainJsVueEntrys(source)
  }
}

function findMainJsVueEntrys(source) {
  const parse = require("@babel/parser")

  let sourseParse = parse.parse(source, { sourceType: "module" })
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

function findMainTsVueEntry(source) {
  const ts = require('typescript')
  let vueEntrys = []

  let sourseParse = ts.createSourceFile('x.ts', source, ts.ScriptTarget.Latest, true);
  console.log('sourseParse', sourseParse)
  let astBody = sourseParse.statements
  

  astBody.forEach(ast => {
    if (ast.kind === ts.SyntaxKind.ImportDeclaration) {
      if (ast.moduleSpecifier.text.endsWith('.vue')) {
        vueEntrys.push(ast.moduleSpecifier.text)
      }
    } else if (ast.kind === ts.SyntaxKind.VariableStatement) {
      ast.declarationList.declarations.forEach(declaration => {
        if (get(declaration, ['initializer', 'kind']) === ts.SyntaxKind.CallExpression &&
        get(declaration, ['initializer', 'expression', 'escapedText']) === 'require' &&
        get(declaration, ['initializer', 'arguments', 0, 'text']).endsWith('.vue')
          ) {
          vueEntrys.push(get(declaration, ['initializer', 'arguments', 0, 'text']))
        }
      })
    }
  })
  return vueEntrys
}
