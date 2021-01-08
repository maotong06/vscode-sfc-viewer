const get = require('../utils/get.js')

module.exports = function (source, map) {
  const parser = require("@babel/parser")
  const traverse = require("@babel/traverse")
  console.log('source', source)
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
  console.log('source.slice(path.node.start, path.node.end)', source.slice(start, end))
  this.callback(
    null,
    source,
    map
  )
}