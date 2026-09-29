<script setup lang="ts">
import { computed, ref } from 'vue'
import OpenCC from 'opencc-js'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const direction = ref<'cn-tw' | 'tw-cn' | 'cn-twp' | 'twp-cn' | 'cn-hk' | 'hk-cn'>('cn-tw')
const input = ref('')
const output = computed(() => {
  const [from, to] = direction.value.split('-') as ['cn' | 'tw' | 'twp' | 'hk', 'cn' | 'tw' | 'twp' | 'hk']
  return OpenCC.Converter({ from, to })(input.value)
})
function swap() {
  const pairs: Record<string, typeof direction.value> = { 'cn-tw': 'tw-cn', 'tw-cn': 'cn-tw', 'cn-twp': 'twp-cn', 'twp-cn': 'cn-twp', 'cn-hk': 'hk-cn', 'hk-cn': 'cn-hk' }
  input.value = output.value
  direction.value = pairs[direction.value]
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-select v-model="direction" style="width: 235px"><el-option label="简体 → 台湾繁体" value="cn-tw" /><el-option label="台湾繁体 → 简体" value="tw-cn" /><el-option label="简体 → 台湾繁体词汇" value="cn-twp" /><el-option label="台湾繁体词汇 → 简体" value="twp-cn" /><el-option label="简体 → 香港繁体" value="cn-hk" /><el-option label="香港繁体 → 简体" value="hk-cn" /></el-select><el-button @click="swap">交换方向</el-button><el-button :disabled="!output" @click="copy(output)">复制结果</el-button></div><div class="tool-workbench__grid"><div><label class="tool-workbench__label">输入文本</label><el-input v-model="input" type="textarea" :rows="16" placeholder="输入需要转换的中文" /></div><div><label class="tool-workbench__label">转换结果</label><pre class="tool-workbench__output">{{ output }}</pre></div></div></section><ToolDetail title="说明"><el-text>使用 OpenCC 词典转换简体、台湾繁体和香港繁体，支持词汇级转换。</el-text></ToolDetail></div>
</template>
