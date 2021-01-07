const config = require('../../config.js')
const get = require('../../../lib/util/get.js')

module.exports = function(source) {
  const ts = require('typescript')
  let createAppPosition = 0
  let sourseParse = ts.createSourceFile('main.ts', source, ts.ScriptTarget.Latest, false);
  findCreateAppPos(sourseParse)
  function findCreateAppPos(sourceFile) {
    const ts = require('typescript')
    // console.log('sourceFile', sourceFile)
    delintNode(sourceFile);
  
    function delintNode(node) {
      console.log('delintNode', node, source.slice(node.pos, node.end), node.kind === ts.SyntaxKind.CallExpression, get(node, ['expression', 'escapedText']))
      if (node.kind === ts.SyntaxKind.CallExpression &&
        get(node, ['expression', 'escapedText']) === 'createApp') {
        createAppPosition = node.end
      }
      ts.forEachChild(node, delintNode);
    }
  }
  if (createAppPosition === 0) {
    throw new Error('未找到createApp执行位置')
  }
  const startStr = source.slice(0, createAppPosition)
  const endStr = source.slice(createAppPosition)
  // console.log('createAppPosition', createAppPosition, startStr, endStr)
  return `
import ${config.sfcTagName} from '${config.targetSFCPath}' // eslint-disable-line
import ${config.devComponentTag} from '${config.devComponentPath}' // eslint-disable-line
${startStr}.component('${config.sfcTagName}', ${config.sfcTagName}).component('${config.devComponentTag}', ${config.devComponentTag})${endStr}`
}
