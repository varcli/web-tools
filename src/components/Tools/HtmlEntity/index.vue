<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { escape, unescape } from 'lodash';
import { copy } from '@/utils/string'
import '../workbench.css'
const content = ref('')
const cleanContent = ref('')

const parser = (type: string) => {
  if (type == 'toHTML') {
    //转html
    cleanContent.value = unescape(content.value)
  } else {
    //转实体
    cleanContent.value = escape(content.value)
  }
}

//清空输入框
const clear = () => {
  content.value = ''
  cleanContent.value = ''
}


onMounted(() => {
})

</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="parser('toEntity')">HTML 转实体</el-button>
        <el-button @click="parser('toHTML')">实体转 HTML</el-button>
        <el-button @click="clear">清空</el-button>
      </div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入内容</label>
        <el-input v-model="content" :rows="10" type="textarea" placeholder="请输入内容" />
      </div>
      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">转换结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!cleanContent" @click="copy(cleanContent)">复制结果</el-button></div>
        <el-input v-model="cleanContent" :rows="10" type="textarea" readonly />
      </div>
    </section>
    <ToolDetail title="描述"><el-text>HTML 实体转义，以及将实体还原为 HTML 文本。</el-text></ToolDetail>
  </div>
</template>

<style scoped>

</style>
