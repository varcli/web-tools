<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/string'
import '../workbench.css'

// 状态管理
const activeTab = ref('encode')
const encodeInput = ref('')
const encodeOutput = ref('')
const decodeInput = ref('')
const decodeOutput = ref('')

// 加密处理
const encodeText = () => {
  if (!encodeInput.value) {
    ElMessage.warning('请输入要加密的文本')
    return
  }
  
  try {
    encodeOutput.value = btoa(unescape(encodeURIComponent(encodeInput.value)))
    ElMessage.success('加密成功')
  } catch (error) {
    ElMessage.error('加密失败：' + error)
  }
}

// 解密处理
const decodeText = () => {
  if (!decodeInput.value) {
    ElMessage.warning('请输入要解密的Base64字符串')
    return
  }
  
  try {
    decodeOutput.value = decodeURIComponent(escape(atob(decodeInput.value)))
    ElMessage.success('解密成功')
  } catch (error) {
    ElMessage.error('解密失败：请输入有效的Base64字符串')
  }
}

// 复制结果
const copyEncodeResult = () => {
  if (!encodeOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  copy(encodeOutput.value)
}

const copyDecodeResult = () => {
  if (!decodeOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  copy(decodeOutput.value)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="加密" name="encode">
          <div class="tool-workbench__toolbar"><el-button type="primary" @click="encodeText">加密</el-button></div>
          <div class="tool-workbench__editor">
            <label class="tool-workbench__label">原文</label>
            <el-input
              v-model="encodeInput"
              type="textarea"
              :rows="6"
              placeholder="请输入要加密的文本"
            />
          </div>
          
          <div class="tool-workbench__result">
            <div class="tool-workbench__toolbar"><span class="tool-workbench__label">Base64 结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!encodeOutput" @click="copyEncodeResult">复制结果</el-button></div>
            <el-input
              v-model="encodeOutput"
              type="textarea"
              :rows="6"
              placeholder="加密结果"
              readonly
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="解密" name="decode">
          <div class="tool-workbench__toolbar"><el-button type="primary" @click="decodeText">解密</el-button></div>
          <div class="tool-workbench__editor">
            <label class="tool-workbench__label">Base64 文本</label>
            <el-input
              v-model="decodeInput"
              type="textarea"
              :rows="6"
              placeholder="请输入要解密的Base64字符串"
            />
          </div>
          
          <div class="tool-workbench__result">
            <div class="tool-workbench__toolbar"><span class="tool-workbench__label">解密结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!decodeOutput" @click="copyDecodeResult">复制结果</el-button></div>
            <el-input
              v-model="decodeOutput"
              type="textarea"
              :rows="6"
              placeholder="解密结果"
              readonly
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线Base64加解密工具，支持文本的Base64编码和解码，可用于URL编码、数据传输等场景。
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>
