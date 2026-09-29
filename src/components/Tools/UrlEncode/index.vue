<script setup lang="ts">
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const info = reactive({
  title: "URL编码/解码",
  content: '',
  tranRes: '',
})


//编码
const toEncode = () => {
  info.tranRes = ''
  info.tranRes = encodeURIComponent(info.content)
}

//解码
const toDecode = () => {
  info.tranRes = ''
  info.tranRes = decodeURIComponent(info.content)
}

//clear
const clear = () => {
  info.content = ''
  info.tranRes = ''
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
        <el-button type="primary" @click="toEncode">UrlEncode 编码</el-button>
        <el-button @click="toDecode">UrlDecode 解码</el-button>
        <el-button @click="clear">清空内容</el-button>
      </div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入内容</label>
        <el-input type="textarea" :rows="8" v-model="info.content"></el-input>
      </div>

      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">转换结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!info.tranRes" @click="copyRes">复制结果</el-button></div>
        <el-input type="textarea" :rows="8" v-model="info.tranRes" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线url编码，在线url解码工具
      </el-text> 
    </ToolDetail>

  </div>
</template>

