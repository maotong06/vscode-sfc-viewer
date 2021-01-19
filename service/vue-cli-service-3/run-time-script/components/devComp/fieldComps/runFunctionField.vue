<template>
  <div class="runFunctionBox">
    <img @click="runFunction" src="../img/run.png" alt="" class="icon">
    <span class="key">{{method.key}}</span>
    <input
      :class="{
        prop_input: true,
        error_input: isInputValError
      }"
      :value="inputCache"
      @input="propsInputHandle(method, $event)"
      type="text" placeholder="arguments">
  </div>
</template>

<script>

export default {
  props: ['method'],
  data() {
    return {
      inputCache: '',
      parseArgs: [],
      isInputValError: false
    }
  },
  methods: {
    parse(val) {
      return JSON.parse(val)
    },
    stringify(val) {
      return JSON.stringify(val)
    },
    runFunction() {
      console.log('runFunction1')
      this.$emit('runFunction', this.method.key, this.parseArgs)
    },
    propsInputHandle (prop, $event) {
      this.inputCache = $event.target.value
      try {
        if ($event.target.value === '') {
          this.parseArgs = []
          this.isInputValError = false
          return
        }
        let res = this.parse($event.target.value)
        console.log('res', res, Array.isArray(res))
        if (!Array.isArray(res)) {
          throw new Error()
        }
        this.parseArgs = res
        this.isInputValError = false
      } catch (error) {
        console.log('error')
        this.parseArgs = []
        this.isInputValError = true
      }
    },
  },
}
</script>

<style scoped>
.runFunctionBox {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 16px;
}
.icon {
  height: 20px;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
}
.prop_input {
  width: 200px;
}
.prop_input.error_input {
  -webkit-box-shadow: 0 0 0px 1000px #ee9595  inset !important;
}
.key {
  margin: 0px 8px;
  color: aqua;
}
</style>