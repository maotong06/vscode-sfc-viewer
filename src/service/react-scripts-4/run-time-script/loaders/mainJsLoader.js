const get = require('../utils/get.js')
const config = require('../config.js')

module.exports = function (source, map) {
  const parser = require("@babel/parser")
  const traverse = require("@babel/traverse")
  const sourceParse = parser.parse(source, {
    // parse in strict mode and allow module declarations
    sourceType: "module",
    plugins: [
      // enable jsx and flow syntax
      "jsx",
    ]
  });
  let start = 0
  let end = 0
  traverse.default(sourceParse, {
    enter(path) {
      // console.log(
      //   'path',
      //   path.node, source.slice(path.node.start, path.node.end),
      // )
      if (path.node.type === 'CallExpression' &&
        get(path.node, ['callee', 'object', 'name']) === 'ReactDOM' && 
        get(path.node, ['callee', 'property', 'name']) === 'render'
        ) {
          start = get(path.node, ['arguments', 0, 'start'])
          end = get(path.node, ['arguments', 0, 'end'])
      }
    }
  })
  if (!start || !end) {
    throw new Error('未找到 ReactDOM.render 执行位置')
  }
  let startStr = source.slice(0, start)
  let endStr = source.slice(end)
  let newSource = `import ${config.sfcTagName} from '${config.targetSFCPath}'
${startStr}<${config.sfcTagName} />${endStr}`
  // console.log('source.slice(path.node.start, path.node.end)', newSource)
  this.callback(
    null,
    newSource,
    map
  )
}