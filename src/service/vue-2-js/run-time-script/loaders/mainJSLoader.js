const babelParser = require("@babel/parser")
const get = require('../../lib/util/get.js')
module.exports = function (source, map) {
  console.log('MainLoader Start')
  try {
    let sourseParse = babelParser.parse(source, { sourceType: "module" })
    console.log('sourseParse', sourseParse.program.body)
    let astBody = sourseParse.program.body

    // !!! 目前只考虑在root上的vue实例化，暂不考虑在代码块内的vue实例化
    // !!! 目前只考虑实例化一次的情况

    // 查找vue变量名
    let vueVariableName = ''
    astBody.forEach(ast => {
      if (ast.type === 'ImportDeclaration') {
        if (ast.source.value === 'vue') {
          vueVariableName = ast.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier').local.name
        }
      } else if (ast.type === 'VariableDeclaration') {
        ast.declarations.forEach(declaration => {
          if (declaration.type === 'VariableDeclarator') {
            if (get(declaration, ['init', 'callee', 'name']) === 'require') {
              if (get(declaration, ['init', 'arguments', 0, 'type']) === 'StringLiteral' && get(declaration, ['init', 'arguments', 0, 'value']) === 'vue') {
                vueVariableName = declaration.id.name
              }
            }
          }
        })
      }
    })
    if (!vueVariableName) {
      console.error('未找到vue定义代码')
    }

    // 查找vue实例化的位置
    let newVueAst = null
    // vue实例化的参数
    let newExpre = null
    let newVueObjectProperty = null
    astBody.forEach(ast => {
      if (ast.type === 'ExpressionStatement') {
        newExpre = findNewExpressionInExpression(ast.expression)
        setVueAst(newExpre, ast)
      } else if (ast.type === 'VariableDeclaration') {
        ast.declarations.forEach(declaration => {
          newExpre = findNewExpressionInExpression(declaration.init)
          setVueAst(newExpre, ast)
        })
      }
    })
    function setVueAst (newExpre, ast) {
      if (newExpre && newExpre.callee.name === vueVariableName) {
        newVueAst = ast
        let properties = get(newExpre, ['arguments', 0, 'properties'])
        if (properties) {
          newVueObjectProperty = properties.find(property => {
            if (property.type === 'ObjectMethod') {
              if (property.key.name === 'render') {
                return true
              }
            }
          })
        }
      }
    }
    console.log('newVueObjectProperty', newVueObjectProperty)
    console.log('newVueAst', newVueAst)
    console.log('vueVariableName', vueVariableName)
    if (!newVueAst) {
      console.error('未找到vue初始化代码')
    }
    // 插入vue组件
    const startStr = source.slice(0, newVueAst.start)
    const endStr = source.slice(newVueAst.start)
    const newSourse = `${startStr}
;Vue.component('HelloWorld', ()=> import('./components/HelloWorld.vue')) // eslint-disable-line
${endStr}`
    // console.log('newSourse', newSourse)

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

// 递归查找new运算符
function findNewExpressionInExpression (expression) {
  if (expression.type === 'NewExpression') {
    return expression
  } else if (expression.type === 'MemberExpression') {
    return findNewExpressionInExpression(expression.object)
  } else if (expression.type === 'CallExpression') {
    return findNewExpressionInExpression(expression.callee)
  } else {
    return null
  }
}