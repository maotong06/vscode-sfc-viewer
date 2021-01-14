const fnTypeRE = /^(?:function|class) (\w+)/
import config from '../../config.js'
import getBigVersion from '../../loaders/utils/getBigVersion.js'
let isLegacy = false

const vueBigVersion = getBigVersion(config.vueVersion)
console.log('vueBigVersion', vueBigVersion)
export function getPropType (type) {
  const match = type.toString().match(fnTypeRE)
  return typeof type === 'function'
    ? (match && match[1]) || 'any'
    : 'any'
}


/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */
export function processState (instance) {
  if (vueBigVersion === '3') {
    return Object.keys(instance.data).map(key => ({
      key,
      value: instance.data[key],
      editable: true
    }))
  } else {
    const props = isLegacy
      ? instance._props
      : instance.$options.props
    const getters =
      instance.$options.vuex &&
      instance.$options.vuex.getters
    return Object.keys(instance._data)
      .filter(key => (
        !(props && key in props) &&
        !(getters && key in getters)
      ))
      .map(key => ({
        key,
        value: instance._data[key],
        editable: true
      }))
  }
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */

export function processProps (instance) {
  let props
  const propsData = []
  console.log()
  if (vueBigVersion === '3') {
    for (let key in instance.propsOptions[0]) {
      // key = camelize(key)
      let prop = instance.propsOptions[0][key]
      propsData.push({
        type: 'props',
        key,
        value: instance.props[key],
        editable: true,
        meta: prop ? {
          type: prop.type ? getPropType(prop.type) : 'any',
          required: !!prop.required
        } : {
          type: 'invalid'
        },
        // editable: SharedData.editableProps
      })
    }
    return propsData
  } else if (isLegacy && (props = instance._props)) {
    // 1.x
    return Object.keys(props).map(key => {
      const prop = props[key]
      const options = prop.options
      return {
        type: 'props',
        key: prop.path,
        value: instance[prop.path],
        editable: true,
        meta: options ? {
          type: options.type ? getPropType(options.type) : 'any',
          required: !!options.required,
          // mode: propModes[prop.mode]
        } : {}
      }
    })
  } else if ((props = instance.$options.props)) {
    // 2.0
    const propsData = []
    for (let key in props) {
      const prop = props[key]
      // key = camelize(key)
      propsData.push({
        type: 'props',
        key,
        value: instance[key],
        editable: true,
        meta: prop ? {
          type: prop.type ? getPropType(prop.type) : 'any',
          required: !!prop.required
        } : {
          type: 'invalid'
        },
        // editable: SharedData.editableProps
      })
    }
    return propsData
  } else {
    return []
  }
}

export function processSetupState (instance) {
  console.log('instance.setupState', instance.setupState)
  if (vueBigVersion === '3') {
    return Object.keys(instance.setupState).map(key => ({
      key,
      value: typeof instance.setupState[key] === 'function' ? 'function' : instance.setupState[key],
      editable: typeof instance.setupState[key] === 'function' ? false : true
    }))
  } else {
    return []
  }
}

export function processFunction (instance) {
  console.log('instance.setupState', instance.proxy)
  if (vueBigVersion === '3') {
    return Object.keys(instance.proxy)
      .filter(key => typeof instance.proxy[key] === 'function')
      .map(key => ({
        key,
      }))
  } else {
    return Object.keys(instance)
      .filter(key => (Object.hasOwnProperty.call(instance, key) &&
        (typeof instance[key] === 'function') && 
        !['_c', '$createElement'].includes(key)
        ))
      .map(key => ({
        key,
      }))
  }
}
