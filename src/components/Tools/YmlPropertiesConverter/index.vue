<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { propertiesToYaml, yamlToProperties } from './convert'
import '../workbench.css'

const direction = ref<'yamlToProperties' | 'propertiesToYaml'>('yamlToProperties')
const input = ref('')
const output = ref('')
const error = ref('')
const separator = ref<'=' | ':'>('=')
const sortKeys = ref(true)
const unicodeEscape = ref(false)
const indent = ref(2)

function run() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) { error.value = '请先输入内容'; return }
  try {
    output.value = direction.value === 'yamlToProperties'
      ? yamlToProperties(input.value, separator.value, sortKeys.value, unicodeEscape.value)
      : propertiesToYaml(input.value, indent.value)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '转换失败' }
}

function loadExample() {
  input.value = direction.value === 'yamlToProperties'
    ? 'server:\n  port: 8080\n  host: localhost\ndatabase:\n  url: jdbc:mysql://localhost:3306/demo'
    : 'server.port=8080\nserver.host=localhost\ndatabase.url=jdbc:mysql://localhost:3306/demo'
  output.value = ''
}

function swap() {
  if (output.value) input.value = output.value
  direction.value = direction.value === 'yamlToProperties' ? 'propertiesToYaml' : 'yamlToProperties'
  output.value = ''
  error.value = ''
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <el-radio-group v-model="direction" @change="output = ''; error = ''">
          <el-radio-button label="yamlToProperties">YAML → Properties</el-radio-button>
          <el-radio-button label="propertiesToYaml">Properties → YAML</el-radio-button>
        </el-radio-group>
        <el-button @click="swap">交换方向</el-button>
        <el-button @click="loadExample">示例</el-button>
        <el-button type="primary" @click="run">转换</el-button>
      </div>
      <div class="tool-workbench__options">
        <template v-if="direction === 'yamlToProperties'">
          <span>分隔符</span><el-select v-model="separator" style="width: 80px"><el-option label="=" value="=" /><el-option label=":" value=":" /></el-select>
          <el-checkbox v-model="sortKeys" label="键名排序" />
          <el-checkbox v-model="unicodeEscape" label="Unicode 转义" />
        </template>
        <template v-else><span>缩进</span><el-select v-model="indent" style="width: 100px"><el-option label="2 空格" :value="2" /><el-option label="4 空格" :value="4" /></el-select></template>
      </div>
      <div class="tool-workbench__grid">
        <div class="tool-workbench__field"><label class="tool-workbench__label">输入</label><el-input v-model="input" type="textarea" :rows="16" placeholder="粘贴 YAML 或 Properties 内容" /></div>
        <div class="tool-workbench__field">
          <div class="tool-workbench__row" style="justify-content: space-between; margin-bottom: 9px"><span class="tool-workbench__label" style="margin: 0">转换结果</span><el-button size="small" :disabled="!output" @click="copy(output)">复制</el-button></div>
          <pre class="tool-workbench__output">{{ output }}</pre>
          <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
        </div>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>支持 YAML 与常见 Spring Properties 的双向转换。YAML 嵌套字段展开为点分隔键，数组使用方括号索引。</el-text></ToolDetail>
  </div>
</template>
