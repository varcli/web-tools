<script setup lang="ts">
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'
import { toMorse, toText } from '@/utils/morse'
const info = reactive({
  title: "摩斯电码",
  content: '支持中文的摩斯电码编码(Encode)解码(Decode)',
  tranRes: '',
})

const toEncode = () => {
  info.tranRes = toMorse(info.content)

}

const toDecode = () => {
  info. tranRes = toText(info.content)
}

const clear = () => {
  info.content = ''
  info.tranRes = ''
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="toEncode">摩斯编码</el-button>
        <el-button @click="toDecode">摩斯解码</el-button>
        <el-button @click="clear">清空内容</el-button>
      </div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入内容</label>
        <el-input type="textarea" :rows="8" v-model="info.content"></el-input>
      </div>

      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">转换结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!info.tranRes" @click="copyRes(info.tranRes)">复制结果</el-button></div>
        <el-input type="textarea" :rows="8" v-model="info.tranRes" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        摩尔斯电码（或摩斯电码，Morse code）是一种编码系统，通过不同顺序的信号表示英文字母、数字和标点符号。由美国人艾尔菲德·维尔在协助Samuel Morse发明摩尔斯电报机（1835年）时创造。今天，国际摩尔斯电码仍在使用。
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>
