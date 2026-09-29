<script setup lang="ts">
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy, numberToChinese } from '@/utils/string'
import '../workbench.css'
const info = reactive({
  title: "数字转金额大写",
  content: '',
  tranRes: '',
})

const tran = () => {
  //数字转中文
  info.tranRes = numberToChinese(parseInt(info.content))
}

const clear = () => {
  info.content = ''
  info.tranRes = ''
}

const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar"><el-button type="primary" @click="tran">数字转中文大写</el-button><el-button @click="clear">清空内容</el-button></div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入数字</label>
        <el-input type="number" v-model="info.content" placeholder="请输入数字，最高13位数字"></el-input>
      </div>
      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">转换结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!info.tranRes" @click="copyRes(info.tranRes)">复制结果</el-button></div>
        <el-input type="textarea" :rows="8" v-model="info.tranRes" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        可以将阿拉伯数字金额转换为中文大写金额的在线工具;用户输入阿拉伯数字金额，如100，会立即转换成“壹佰”的中文
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>

</style>
