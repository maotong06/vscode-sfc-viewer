// 修改 main.js 入口文件，注册目标vue sfc组件
const config = require('../config.js')
const getBigVersion = require('./utils/getBigVersion.js')
const vue2mainJs = require('./utils/vue2mainJs.js')
const vue2mainTs = require('./utils/vue2mainTs.js')
const vue3mainJs = require('./utils/vue3mainJs.js')
const vue3mainTs = require('./utils/vue3mainTs.js')


let parse
if (config.isTs) {
  parse = require("typescript")
} else {
  
}
// console.log('config', config)
module.exports = function (source, map) {
  console.log('MainLoader Start')
  try {
    let newSourse
    let version = getBigVersion(config.vueVersion)
    if (config.isTs) {
      if (version === '3') {
        newSourse = vue3mainTs(source)
      } else if (version === '2') {
        newSourse = vue2mainTs(source)
      }
    } else {
      if (version === '3') {
        newSourse = vue3mainJs(source)
      } else if (version === '2') {
        newSourse = vue2mainJs(source)
      }
    }
    // console.log('newSourse', newSourse)
    this.callback(
      null,
      newSourse,
      map
    )
  } catch (error) {
    console.error(error)
  }

}

