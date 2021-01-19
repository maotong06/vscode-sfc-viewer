<template>
  <div class="vscode-dev-comp">
    <div class="showBtn" @click="isShowConsole = true" v-show="!isShowConsole">
    </div>
    <div class="console_box" v-show="isShowConsole">
      <div class="kongbai" @click.self="isShowConsole = false">

      </div>
      <div class="field_content">
        <fieldContainer>
          <template v-slot:title>
            props:
          </template>
          <template v-slot:content>
            <dataField
              v-for="(prop) in vmProps"
              :key="prop.key"
              ref="dataField"
              type="props"
              :prop="prop"
              @addRef="addRef"
              @currentEditingFieldChange="currentEditingFieldChange"
              @saveValue="saveValue"/>
          </template>
        </fieldContainer>
        <fieldContainer>
          <template v-slot:title>
            data: 
          </template>
          <template v-slot:content>
            <dataField
              v-for="(prop) in vmDatas"
              :key="prop.key"
              ref="dataField"
              :prop="prop"
              type="data"
              @addRef="addRef"
              @currentEditingFieldChange="currentEditingFieldChange"
              @saveValue="saveValue"/>
          </template>
        </fieldContainer>
        <fieldContainer>
          <template v-slot:title>
            setupState: 
          </template>
          <template v-slot:content>
            <dataField
              v-for="(prop) in vmSetupState"
              :key="prop.key"
              ref="dataField"
              :prop="prop"
              type="setupState"
              @addRef="addRef"
              @currentEditingFieldChange="currentEditingFieldChange"
              @saveValue="saveValue"/>
          </template>
        </fieldContainer>
        <fieldContainer>
          <template v-slot:title>
            run methods: 
          </template>
          <template v-slot:content>
            <runFunctionField
            v-for="(prop) in vmFunctions"
            :key="prop.key"
            :method="prop"
            @runFunction="runFunction"/>
          </template>
        </fieldContainer>
      </div>
    </div>
  </div>
</template>

<script>
import { processState, processProps, processSetupState, processFunction } from './process'
import dataField from './fieldComps/dataField.vue'
import runFunctionField from './fieldComps/runFunctionField.vue'
import fieldContainer from './fieldComps/fieldContainer.vue'
import config from '../../config.js'
import getBigVersion from '../../loaders/utils/getBigVersion.js'
const vueBigVersion = getBigVersion(config.vueVersion)

export default {
  components: {
    dataField,
    runFunctionField,
    fieldContainer,
  },
  data() {
    return {
      vmProps: [],
      vmDatas: [],
      vmSetupState: [],
      vmFunctions: [],
      vm: {},
      isShowConsole: false,
      dataRefs: [],
      vueBigVersion: vueBigVersion
    }
  },
  mounted() {
    this.$nextTick(() => {
      let targetComponent
      console.log('this', this.$parent.$)
      if (vueBigVersion === '3') {
        targetComponent = this.$parent.$.subTree.children.find(i => {
          return config.targetSFCPath.indexOf(i.type.__file) > -1
        }).component
      } else {
        targetComponent = this.$parent.$children.find(i => {
          if (i.$options) {
            return i.$options._componentTag === config.sfcTagName
          }
        })
      }
      console.log('targetComponent', targetComponent)
      this.vm = targetComponent
      window.$vm = this.vm
      for (const key in this.vm) {
        if (Object.hasOwnProperty.call(this.vm, key)) {
          if (typeof this.vm[key] === 'function') {
            const element = this.vm[key];
            console.log('key', key)
          }
        }
      }
      this.initData()
    })
  },
  methods: {
    initData() {
      this.vmProps = processProps(this.vm)
      this.vmDatas = processState(this.vm)
      this.vmSetupState = processSetupState(this.vm)
      this.vmFunctions = processFunction(this.vm)
      console.log('this.vmProps', this.vmProps)
      console.log('this.vmDatas', this.vmDatas)
      console.log('this.vmSetupState', this.vmSetupState)
      console.log('this.vmFunctions', this.vmFunctions)
    },
    saveValue(key, value, type) {
      console.log('this.vm', this.vm)
      if (vueBigVersion === '3') {
        this.vm[type][key] = value
      } else {
        this.vm[key] = value
      }
      this.initData()
    },
    currentEditingFieldChange() {
      console.log('his.$refs.dataField', this.dataRefs)
      if (vueBigVersion === '3') {
        this.dataRefs && this.dataRefs.forEach(i => {
          i.cancelInput()
        })
      } else {
        this.$refs.dataField && this.$refs.dataField.forEach(i => {
          i.cancelInput()
        })
      }
    },
    addRef(vm) {
      this.dataRefs.push(vm)
    },
    runFunction(key, args) {
      console.log('runFunction')
      if (vueBigVersion === '3') {
        this.vm.proxy[key](...args)
      } else {
        this.vm[key](...args)
      }
    }
  }
}
</script>

<style scoped>
.vscode-dev-comp {
  font-size: 12px;
  text-align: left;
}
.showBtn {
  position: fixed;
  z-index: 99999999999;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0px 0px 20px #888888;
  
  background-image: url('./img/vue_config.png');
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: center;

  cursor: pointer;
}
.console_box {
  position: fixed;
  z-index: 999999999999;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
}
.console_box .kongbai {
  height: 70vh;
  background-color: rgba(0, 0, 0, 0.3);
}
.console_box .field_content {
  height: 30vh;
  overflow: scroll;
  background-color: white;
  padding: 10px;
}
</style>