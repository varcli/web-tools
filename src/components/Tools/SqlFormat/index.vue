<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/string'
import { format } from 'sql-formatter'
import '../workbench.css'


// 状态管理
const inputText = ref('')
const outputText = ref('')
const indentSize = ref(4)

// 格式化SQL
const formatSql = () => {
  if (!inputText.value) {
    ElMessage.warning('请输入要格式化的SQL')
    return
  }
  
  try {
    // 使用sql-formatter库格式化SQL
    const formatted = format(inputText.value)
    outputText.value = formatted
    ElMessage.success('格式化成功')
  } catch (error) {
    outputText.value = '格式化失败'
    ElMessage.error('格式化失败：' + error)
  }
}

// 压缩SQL
const minifySql = () => {
  if (!inputText.value) {
    ElMessage.warning('请输入要压缩的SQL')
    return
  }
  
  try {
    // 压缩SQL（去除空格和换行）
    const minified = inputText.value
      .replace(/\s+/g, ' ') // 替换多个空白字符为单个空格
      .trim()
    
    outputText.value = minified
    ElMessage.success('压缩成功')
  } catch (error) {
    outputText.value = '压缩失败'
    ElMessage.error('压缩失败：' + error)
  }
}



// 复制结果
const copyResult = () => {
  if (!outputText.value || outputText.value === '格式化失败' || outputText.value === '压缩失败') {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  copy(outputText.value)
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="formatSql">格式化</el-button>
        <el-button @click="minifySql">压缩</el-button>
        <el-button @click="clearInput">清空</el-button>
      </div>
      <!-- 输入部分 -->
      <div class="mb-4">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          placeholder="请输入要格式化的SQL"
          class="mb-2"
        />
        
        <div class="flex items-center gap-2 mb-2">
          <el-text>缩进大小：</el-text>
          <el-input-number v-model="indentSize" :min="1" :max="8" size="small" />
        </div>
      </div>
      
      <!-- 结果部分 -->
      <div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="6"
          placeholder="格式化结果"
          readonly
        >
          <template #append>
            <el-button @click="copyResult">复制</el-button>
          </template>
        </el-input>
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线SQL格式化工具，用于美化和压缩SQL代码，支持自定义缩进大小，使SQL代码更易于阅读和维护。
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>
