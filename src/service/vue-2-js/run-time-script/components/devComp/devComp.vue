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
          :prop="prop"
          @currentEditingFieldChange="currentEditingFieldChange"
          @saveValue="saveValue"/>
        <div>data: </div>
        <dataField
          v-for="(prop) in vmDatas"
          :key="prop.key"
          ref="dataField"
          :prop="prop"
          @currentEditingFieldChange="currentEditingFieldChange"
          @saveValue="saveValue"/>
        </div>
      </div>
  </div>
</template>

<script>
import { processState, processProps } from './process'
import dataField from './fieldComps/dataField.vue'

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
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log('this.$parent', this.$parent)
      let helloWorldComp = this.$parent.$children.find(i => i.$vnode.tag.includes('HelloWorld'))
      console.log('helloWorldComp._props', helloWorldComp)
      this.vm = helloWorldComp
      this.initData()
    })
  },
  methods: {
    initData() {
      this.vmProps = processProps(this.vm)
      this.vmDatas = processState(this.vm)
    },
    saveValue(key, value) {
      this.vm[key] = value
      this.initData()
    },
    currentEditingFieldChange() {
      this.$refs.dataField.forEach(i => {
        i.cancelInput()
      })
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