<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { childSubnets, subnetInfo } from './subnet'
import '../workbench.css'

const cidr = ref('192.168.1.0/24')
const splitPrefix = ref(26)
const result = computed(() => {
  try { return { info: subnetInfo(cidr.value), error: '' } }
  catch (cause) { return { info: null, error: cause instanceof Error ? cause.message : '地址无效' } }
})
const subnets = computed(() => result.value.info ? childSubnets(cidr.value, splitPrefix.value) : [])
const rows = computed(() => result.value.info ? [
  { label: 'IP 地址', value: result.value.info.ip },
  { label: '网络地址', value: result.value.info.network },
  { label: '子网掩码', value: result.value.info.mask },
  { label: '通配符掩码', value: result.value.info.wildcard },
  { label: '广播地址', value: result.value.info.broadcast },
  { label: '首个可用地址', value: result.value.info.first },
  { label: '最后可用地址', value: result.value.info.last },
  { label: '地址总数', value: result.value.info.addressCount.toLocaleString() },
  { label: '可用主机数', value: result.value.info.hostCount.toLocaleString() },
] : [])
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><span class="tool-workbench__label" style="margin: 0">IPv4 / CIDR</span><el-input v-model="cidr" placeholder="192.168.1.0/24" style="max-width: 260px" /><el-button @click="copy(cidr)">复制 CIDR</el-button></div>
      <p v-if="result.error" class="tool-workbench__error" role="alert">{{ result.error }}</p>
      <template v-else-if="result.info">
        <div class="subnet-grid"><div v-for="row in rows" :key="row.label"><span>{{ row.label }}</span><strong>{{ row.value }}</strong></div></div>
        <p class="binary">二进制：{{ result.info.binary }}</p>
        <div v-if="result.info.prefix < 32" class="tool-workbench__row"><span class="tool-workbench__label" style="margin: 0">划分子网前缀</span><el-input-number v-model="splitPrefix" :min="result.info.prefix + 1" :max="32" style="width: 120px" /><span class="tool-workbench__hint">最多展示前 128 个子网</span></div>
        <div v-if="subnets.length" class="subnet-list"><code v-for="subnet in subnets" :key="subnet">{{ subnet }}</code></div>
      </template>
    </section>
    <ToolDetail title="说明"><el-text>输入 IPv4 CIDR 后计算网络地址、掩码、广播地址、可用主机范围和子网划分。/31 按点对点链路计 2 个可用地址，/32 计 1 个。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.subnet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
.subnet-grid > div { display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }
.subnet-grid span, .binary { color: var(--app-text-muted); font-size: 13px; }.subnet-grid strong { color: var(--app-text); }
.binary { overflow-wrap: anywhere; font-family: Consolas, monospace; }.subnet-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 8px; max-height: 250px; overflow: auto; }.subnet-list code { padding: 7px; border: 1px solid var(--app-border); border-radius: 7px; color: var(--app-text); }
</style>
