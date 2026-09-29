<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

interface Entry { time: string; kind: '系统' | '发送' | '接收' | '错误'; content: string }
const address = ref('')
const message = ref('')
const connected = ref(false)
const connecting = ref(false)
const prettyJson = ref(true)
const heartbeat = ref(false)
const heartbeatSeconds = ref(30)
const heartbeatMessage = ref('ping')
const entries = ref<Entry[]>([])
let socket: WebSocket | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

function log(kind: Entry['kind'], content: string) {
  entries.value.push({ time: new Date().toLocaleTimeString(), kind, content })
  if (entries.value.length > 500) entries.value.shift()
}

function display(value: string) {
  if (!prettyJson.value) return value
  try { return JSON.stringify(JSON.parse(value), null, 2) }
  catch { return value }
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = null
}

function startHeartbeat() {
  stopHeartbeat()
  if (!heartbeat.value || !socket || !connected.value) return
  heartbeatTimer = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(heartbeatMessage.value)
      log('发送', heartbeatMessage.value)
    }
  }, Math.max(1, heartbeatSeconds.value) * 1000)
}

function disconnect() {
  stopHeartbeat()
  socket?.close()
  socket = null
  connected.value = false
  connecting.value = false
}

function connect() {
  disconnect()
  try {
    const url = new URL(address.value)
    if (!['ws:', 'wss:'].includes(url.protocol)) throw new Error('地址必须以 ws:// 或 wss:// 开头')
    connecting.value = true
    const current = new WebSocket(url.href)
    socket = current
    current.onopen = () => { if (socket !== current) return; connecting.value = false; connected.value = true; log('系统', `已连接 ${url.href}`); startHeartbeat() }
    current.onmessage = event => { if (socket === current) log('接收', display(String(event.data))) }
    current.onerror = () => { if (socket === current) log('错误', '连接或传输失败，请检查地址和服务状态') }
    current.onclose = event => { if (socket !== current) return; stopHeartbeat(); connected.value = false; connecting.value = false; log('系统', `连接已关闭（${event.code}）`) }
  } catch (cause) { connecting.value = false; log('错误', cause instanceof Error ? cause.message : '无法连接') }
}

function send() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(message.value)
  log('发送', display(message.value))
}

onBeforeUnmount(disconnect)
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <el-input v-model="address" placeholder="wss://example.com/socket" style="max-width: 540px" :disabled="connected || connecting" />
        <el-button v-if="!connected" type="primary" :loading="connecting" @click="connect">连接</el-button>
        <el-button v-else type="danger" @click="disconnect">断开</el-button>
        <el-tag :type="connected ? 'success' : 'info'">{{ connected ? '已连接' : connecting ? '连接中' : '未连接' }}</el-tag>
      </div>
      <div class="tool-workbench__options">
        <el-checkbox v-model="prettyJson" label="美化 JSON 消息" />
        <el-checkbox v-model="heartbeat" label="心跳" @change="startHeartbeat" />
        <template v-if="heartbeat"><span>间隔（秒）</span><el-input-number v-model="heartbeatSeconds" :min="1" :max="3600" style="width: 115px" @change="startHeartbeat" /><el-input v-model="heartbeatMessage" placeholder="心跳内容" style="width: 130px" /></template>
      </div>
      <label class="tool-workbench__label">发送消息</label>
      <el-input v-model="message" type="textarea" :rows="4" placeholder="输入文本或 JSON 消息" />
      <div class="tool-workbench__row" style="margin-top: 12px">
        <el-button type="primary" :disabled="!connected || !message" @click="send">发送</el-button>
        <el-button :disabled="!entries.length" @click="copy(entries.map(item => `[${item.time}] ${item.kind}: ${item.content}`).join('\n'))">复制记录</el-button>
        <el-button @click="entries = []">清空记录</el-button>
      </div>
      <div class="tool-workbench__label">消息记录（{{ entries.length }}）</div>
      <div class="message-list">
        <div v-for="(entry, index) in entries" :key="index" class="message-entry">
          <span>{{ entry.time }}</span><el-tag size="small" :type="entry.kind === '错误' ? 'danger' : entry.kind === '接收' ? 'success' : 'info'">{{ entry.kind }}</el-tag><pre>{{ entry.content }}</pre>
        </div>
        <p v-if="!entries.length" class="tool-workbench__hint">连接后，发送和接收的消息会显示在这里。</p>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>连接指定的 ws:// 或 wss:// 服务，发送文本消息、查看收发记录，并可设置定时心跳。离开页面时会关闭连接。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.message-list { max-height: 440px; min-height: 160px; padding: 8px 12px; overflow: auto; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }
.message-entry { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--app-border); color: var(--app-text-muted); font-size: 12px; }
.message-entry pre { min-width: 0; margin: 0; color: var(--app-text); white-space: pre-wrap; overflow-wrap: anywhere; font: 13px/1.5 Consolas, monospace; }
</style>
