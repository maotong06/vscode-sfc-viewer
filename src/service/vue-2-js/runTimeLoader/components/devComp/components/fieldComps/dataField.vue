<template>
  <div class="item_box">
    <div class="key_text flex_item">
      {{prop.key}}: 
    </div>
    
    <div class="flex_item">
      <span class="prop_value" v-show="!isEditing" @dblclick="editing(prop)">{{prop.value}}</span>
      <input
        :class="{
          prop_input: true,
          error_input: isInputValError
        }"
        ref="inputRef"
        v-show="isEditing"
        type="text"
        @input="propsInputHandle(prop, $event)"
        :value="inputCache">
    </div>
    <div class="flex_item" v-if="isEditing">
      <img src="../img/cancle.png" alt="" class="icon" @click="cancelInput(prop)">
      <img src="../img/save.png" alt="" class="more_img icon" @click="saveValue(prop)">
    </div>
    <div v-else class="flex_item">
      <img src="../img/edit.png" alt="" class="icon" @click="editing(prop)">
      <!-- <span class="more_img_box">
        <img src="../img/more.png" alt="" class="more_img icon" >
        <div class="more_tips">
          type: {{prop.meta.type}}<br/>
          required: {{prop.meta.required ? 'true' : 'false'}}
        </div>
      </span> -->
    </div>
  </div>
</template>

<script>
export default {
  props: ['prop'],
  data() {
    return {
      isInputValError: false,
      isEditing: false,
      inputCache: '',
    }
  },
  methods: {
    parse(val) {
      return JSON.parse(val)
    },
    stringify(val) {
      return JSON.stringify(val)
    },
    propsInputHandle (prop, $event) {
      this.inputCache = $event.target.value
      try {
        this.parse($event.target.value)
        this.isInputValError = false
      } catch (error) {
        console.log('error')
        this.isInputValError = true
      }
    },
    editing(prop) {
      this.$emit('currentEditingFieldChange')
      this.isEditing = true
      this.isInputValError = false
      this.inputCache = this.stringify(prop.value)
      this.$nextTick(() => {
        let ref = this.$refs['inputRef']
        if (ref) {
          console.log('ref.focus', ref.focus)
            ref.focus()
        }
      })
    },
    saveValue() {
      console.log('this.isEditing', this.isEditing)
      if (this.isInputValError) {
        return
      }
      this.isEditing = false
      this.$emit('saveValue', this.prop.key, this.parse(this.inputCache))
    },
    cancelInput() {
      this.isEditing = false
    }
  }
}
</script>

<style scoped>
.item_box {
  font-size: 16px;
  height: 20px;
  line-height: 20px;
  display: flex;
}
.item_box .prop_value {
  width: 200px;
  margin-right: 10px;
}
.item_box .more_img_box {
  position: relative;
}
.item_box .more_img_box .more_tips {
  position: absolute;
  top: -40px;
  width: 100px;
  display: none;
  background: rgb(105,105,105);
  left: 50%;
  transform: translate(-50%, 0);
  color: white;
}
.item_box .more_img_box:hover .more_tips {
  display: block;
}

.item_box .more_img {
  cursor:pointer
}
.icon {
  height: 20px;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
}
.item_box .prop_input {
  width: 200px;
}
.item_box .prop_input.error_input {
  -webkit-box-shadow: 0 0 0px 1000px #ee9595  inset !important;
}
.key_text {
  color: darkmagenta;
  margin-right: 15px;
}
</style>