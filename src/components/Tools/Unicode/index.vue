<script setup lang="ts">
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Codemirror } from "vue-codemirror"
// import { lineNumbers } from '@codemirror/view';
import { copy } from '@/utils/string'
import '../workbench.css'


const info = reactive({
  title: "Unicode转中文",
  // extensions: [lineNumbers()],
  content: '',
  tranRes: '',
})

const clearRes = () => {
  info.tranRes = ''
}

//to zh
//值转换中文
const toZH = () => {
  //clear
  clearRes()
  let str = info.content
  str = str.replace(/\\/g, "%");
  // 转换中文
  str = unescape(str);
  info.tranRes = str
}
//to unicode
const toUnicode = () => {
  //clear
  clearRes()
  //只转换中文
  for (let i = 0; i < info.content.length; i++) {
    if (/^[\u4E00-\u9FA5\uF900-\uFA2D]+$/.test(info.content[i])) {
      let code = info.content.charCodeAt(i).toString(16)
      info.tranRes += '\\u' + code
    } else {
      info.tranRes += info.content[i]
    }
  }
}

//copy
const copyRes = async () => {
  copy(info.tranRes)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="toZH">Unicode 转中文</el-button>
        <el-button @click="toUnicode">中文转 Unicode</el-button>
      </div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入内容</label>
        <codemirror
          v-model="info.content"
          placeholder=""
          :style="{ height: '200px' }"
          :autofocus="true"
          :indent-with-tab="true" 
          :tabSize="2"
        />
      </div>

      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">转换结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!info.tranRes" @click="copyRes">复制结果</el-button></div>
        <el-input type="textarea" :rows="8" v-model="info.tranRes" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        Unicode是计算机科学领域里的一项业界标准，有时候我们需要对一段文本或者一段内容进行重新排版编译的时候就需要将获取的值进行转码。
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>
