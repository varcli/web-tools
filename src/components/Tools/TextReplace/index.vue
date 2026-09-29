<script setup lang="ts">
import '../workbench.css'
import { ref, computed } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/string'


// 状态管理
const inputText = ref('')
const findText = ref('')
const replaceText = ref('')
const useRegex = ref(false)
const caseSensitive = ref(true)

// 替换结果
const replaceResult = computed(() => {
  if (!inputText.value) return ''
  if (!findText.value) return inputText.value
  
  try {
    if (useRegex.value) {
      // 使用正则表达式替换
      const regex = new RegExp(findText.value, caseSensitive.value ? 'g' : 'gi')
      return inputText.value.replace(regex, replaceText.value)
    } else {
      // 使用普通文本替换
      if (caseSensitive.value) {
        return inputText.value.replace(new RegExp(findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText.value)
      } else {
        return inputText.value.replace(new RegExp(findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText.value)
      }
    }
  } catch (error) {
    return '替换失败：正则表达式语法错误'
  }
})

// 复制结果
const copyResult = () => {
  if (!replaceResult.value || replaceResult.value === '替换失败：正则表达式语法错误') {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  copy(replaceResult.value)
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  findText.value = ''
  replaceText.value = ''
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button @click="copyResult">复制结果</el-button>
        <el-button @click="clearInput">清空</el-button>
      </div>
      <!-- 输入部分 -->
      <div class="mb-4">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          placeholder="请输入要处理的文本"
          class="mb-2"
        />
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <el-input
              v-model="findText"
              placeholder="请输入要查找的文本"
              class="mb-2"
            />
          </div>
          <div>
            <el-input
              v-model="replaceText"
              placeholder="请输入要替换的文本"
              class="mb-2"
            />
          </div>
        </div>
        
        <div class="flex items-center gap-4 mb-2">
          <el-checkbox v-model="useRegex">使用正则表达式</el-checkbox>
          <el-checkbox v-model="caseSensitive">区分大小写</el-checkbox>
        </div>
      </div>

      
      <!-- 结果部分 -->
      <div>
        <el-input
          :value="replaceResult"
          type="textarea"
          :rows="6"
          placeholder="替换结果"
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
        在线文本替换工具，支持普通文本和正则表达式替换，可用于批量修改文本内容，支持区分大小写选项。
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>