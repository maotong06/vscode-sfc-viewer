<template>
  <div class="vscode-dev-comp">
    <div class="showBtn" @click="isShowConsole = true" v-show="!isShowConsole">
    </div>
    <div class="console_box" v-show="isShowConsole">
      <div class="kongbai" @click.self="isShowConsole = false">

      </div>
      <div class="field_content">
        <div>props: </div>
        <dataField
          v-for="(prop) in vmProps"
          :key="prop.key"
          ref="dataField"
          type="props"
          :prop="prop"
          @addRef="addRef"
          @currentEditingFieldChange="currentEditingFieldChange"
          @saveValue="saveValue"/>
        <div>data: </div>
        <dataField
          v-for="(prop) in vmDatas"
          :key="prop.key"
          ref="dataField"
          :prop="prop"
          type="data"
          @addRef="addRef"
          @currentEditingFieldChange="currentEditingFieldChange"
          @saveValue="saveValue"/>
        </div>
      </div>
  </div>
</template>

<script>
import { processState, processProps } from './process'
import dataField from './fieldComps/dataField.vue'
import config from '../../config.js'
import getBigVersion from '../../loaders/utils/getBigVersion.js'
const vueBigVersion = getBigVersion(config.vueVersion)

export default {
  components: {
    dataField,
  },
  data() {
    return {
      vmProps: [],
      vmDatas: [],
      vm: {},
      isShowConsole: false,
      dataRefs: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      let targetComponent
      console.log('this', this.$parent.$)
      if (vueBigVersion === '3') {
        targetComponent = this.$parent.$.subTree.children.find(i => {
          return config.targetSFCPath.indexOf(i.type.__file) > -1
        })
      } else {
        targetComponent = this.$parent.$children.find(i => i.$vnode.tag.includes('HelloWorld'))
      }
      console.log('targetComponent', targetComponent)
      this.vm = targetComponent.component
      this.initData()
    })
  },
  methods: {
    initData() {
      this.vmProps = processProps(this.vm)
      this.vmDatas = processState(this.vm)
      console.log('this.vmProps', this.vmProps)
      console.log('this.vmDatas', this.vmDatas)
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
}
</style>