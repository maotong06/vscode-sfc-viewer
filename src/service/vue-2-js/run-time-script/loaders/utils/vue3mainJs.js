const config = require('../../config.js')
const get = require('../../../lib/util/get.js')


module.exports = function(source) {
  const parse = require("@babel/parser")
  const traverse = require("@babel/traverse")
  let createAppPosition = 0

  let sourseParse = parse.parse(source, { sourceType: "module" })

  traverse.default(sourseParse, {
    enter(path) {
      // console.log(
      //   'path',
      //   path.node, source.slice(path.node.start, path.node.end),
      //   path.node.type, get(path.node, ['callee', 'name']),
      //   path.node.type === 'CallExpression' && get(path.node, ['callee', 'name']) === 'createApp'
      // )
      if (path.node.type === 'CallExpression' &&
        get(path.node, ['callee', 'name']) === 'createApp'
        ) {
          // console.log('path2', path.node, source.slice(path.node.start, path.node.end))
          createAppPosition = path.node.end
        }
    }
  })

  const startStr = source.slice(0, createAppPosition)
  const endStr = source.slice(createAppPosition)

  return `
import ${config.sfcTagName} from '${config.targetSFCPath}' // eslint-disable-line
import ${config.devComponentTag} from '${config.devComponentPath}' // eslint-disable-line
${startStr}.component('${config.sfcTagName}', ${config.sfcTagName}).component('${config.devComponentTag}', ${config.devComponentTag})${endStr}
  `
}