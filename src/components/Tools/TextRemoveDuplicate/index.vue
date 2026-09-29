<script setup lang="ts">
import { reactive, computed } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const info = reactive({
  title: "文本去重",
  content: '',
  tranRes: '',
})


//clear
const clear = () => {
  info.content = ''
}


const removeDuplicate = computed(() => {
  let tmpArr = info.content.split('\n')
  let resultSet = new Set(tmpArr)
  let fromResArr = Array.from(resultSet)
  info.tranRes = fromResArr.join("\n")
  return info.tranRes 
})

//copy
const copyRes = async () => {
  copy(info.tranRes)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar"><el-button @click="clear">清空内容</el-button></div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入文本</label>
        <el-input type="textarea" :rows="8" v-model="info.content"></el-input>
      </div>
      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">去重结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!removeDuplicate" @click="copyRes">复制结果</el-button></div>
        <el-input type="textarea" :rows="8" v-model="removeDuplicate" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        可以删除或去除文本或字符串中的重复行
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>
