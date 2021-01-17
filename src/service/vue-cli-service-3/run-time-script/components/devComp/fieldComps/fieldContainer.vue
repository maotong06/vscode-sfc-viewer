<template>
  <div class="container">
    <header class="header" @click="isShow = !isShow">
      <img src="../img/arrow-right.png" alt="" :class="{icon: true, isShow: isShow}">
      <h4>
        <slot name="title"></slot>
      </h4>
    </header>
    <main :class="{content: true, hidden: !isShow}" ref="contentRef">
      <div class="content_inner" ref="contentInnerRef">
        <slot name="content"></slot>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
    }
  },
  watch: {
    isShow(val) {
      let innerHeight = this.$refs.contentInnerRef.getBoundingClientRect().height
      if (!val) {
        this.$refs.contentRef.style.height = '0'
      } else {
        this.$refs.contentRef.style.height = innerHeight + 'px'
      }
    }
  },
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}
.icon {
  height: 15px;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  transition: all 200ms;
}
.content {
  transition: all 200ms;
  overflow: hidden;
}
.content.hidden {
  height: 0px !important;
}
.icon.isShow {
  transform: rotate(90deg)
}
.content_inner {
  margin-left: 20px;
}
</style>