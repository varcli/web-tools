<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '../workbench.css'

interface KeyDef { code: string; label: string; width?: number }
interface EventLog { time: string; action: string; key: string; code: string; keyCode: number }
const layout = ref<'windows' | 'mac'>('windows')
const pressed = ref<string[]>([])
const tested = ref<string[]>([])
const last = ref<EventLog>()
const logs = ref<EventLog[]>([])
const rows: KeyDef[][] = [
  'Escape Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal Backspace'.split(' ').map(code => ({ code, label: code === 'Escape' ? 'Esc' : code === 'Backspace' ? '⌫' : code.startsWith('Digit') ? code.slice(5) : ({ Minus: '-', Equal: '=' } as Record<string, string>)[code], width: code === 'Backspace' ? 2 : 1 })),
  'Tab KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP BracketLeft BracketRight Backslash'.split(' ').map(code => ({ code, label: code === 'Tab' ? 'Tab' : code.startsWith('Key') ? code.slice(3) : ({ BracketLeft: '[', BracketRight: ']', Backslash: '\\' } as Record<string, string>)[code], width: code === 'Tab' ? 1.5 : 1 })),
  'CapsLock KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon Quote Enter'.split(' ').map(code => ({ code, label: code === 'CapsLock' ? 'Caps' : code === 'Enter' ? 'Enter' : code.startsWith('Key') ? code.slice(3) : code === 'Semicolon' ? ';' : "'", width: code === 'CapsLock' || code === 'Enter' ? 1.8 : 1 })),
  'ShiftLeft KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash ShiftRight'.split(' ').map(code => ({ code, label: code.startsWith('Shift') ? 'Shift' : code.startsWith('Key') ? code.slice(3) : ({ Comma: ',', Period: '.', Slash: '/' } as Record<string, string>)[code], width: code.startsWith('Shift') ? 2.3 : 1 })),
  [{ code: 'ControlLeft', label: 'Ctrl', width: 1.4 }, { code: 'MetaLeft', label: 'Win', width: 1.4 }, { code: 'AltLeft', label: 'Alt', width: 1.4 }, { code: 'Space', label: 'Space', width: 5 }, { code: 'AltRight', label: 'Alt', width: 1.4 }, { code: 'MetaRight', label: 'Win', width: 1.4 }, { code: 'ControlRight', label: 'Ctrl', width: 1.4 }],
]
const keyLabel = (key: KeyDef) => key.code.startsWith('Meta') && layout.value === 'mac' ? '⌘' : key.code.startsWith('Alt') && layout.value === 'mac' ? '⌥' : key.label

function record(event: KeyboardEvent, action: '按下' | '松开') {
  if (event.target === document.body && (event.code === 'Space' || event.code.startsWith('Arrow'))) event.preventDefault()
  if (action === '按下') {
    if (!pressed.value.includes(event.code)) pressed.value.push(event.code)
    if (!tested.value.includes(event.code)) tested.value.push(event.code)
  } else pressed.value = pressed.value.filter(code => code !== event.code)
  const entry = { time: new Date().toLocaleTimeString(), action, key: event.key, code: event.code, keyCode: event.keyCode }
  last.value = entry
  logs.value.unshift(entry)
  if (logs.value.length > 100) logs.value.pop()
}
const onDown = (event: KeyboardEvent) => { if (!event.repeat) record(event, '按下') }
const onUp = (event: KeyboardEvent) => record(event, '松开')
const onBlur = () => { pressed.value = [] }
let listening = false
function startListening() {
  if (listening) return
  window.addEventListener('keydown', onDown)
  window.addEventListener('keyup', onUp)
  window.addEventListener('blur', onBlur)
  listening = true
}
function stopListening() {
  if (!listening) return
  window.removeEventListener('keydown', onDown)
  window.removeEventListener('keyup', onUp)
  window.removeEventListener('blur', onBlur)
  pressed.value = []
  listening = false
}
onMounted(startListening)
onActivated(startListening)
onDeactivated(stopListening)
onBeforeUnmount(stopListening)
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><el-radio-group v-model="layout"><el-radio-button label="windows">Windows</el-radio-button><el-radio-button label="mac">Mac</el-radio-button></el-radio-group><el-tag>已测试 {{ tested.length }} 个按键</el-tag><el-button @click="tested = []; logs = []; last = undefined">重置</el-button></div>
      <p class="tool-workbench__hint">在页面中按下键盘，按键会高亮；如需测试系统快捷键，请注意浏览器可能先拦截。</p>
      <div class="keyboard"><div v-for="(row, index) in rows" :key="index" class="keyboard-row"><div v-for="key in row" :key="key.code" class="key" :class="{ active: pressed.includes(key.code), tested: tested.includes(key.code) }" :style="{ flex: key.width ?? 1 }">{{ keyLabel(key) }}</div></div></div>
      <div v-if="last" class="last-event"><span>最近事件：{{ last.action }}</span><strong>{{ last.key }}</strong><code>event.code: {{ last.code }}</code><code>keyCode: {{ last.keyCode }}</code></div>
      <h3>事件记录</h3><el-table :data="logs" max-height="300" empty-text="按下任意按键开始测试"><el-table-column prop="time" label="时间" width="100" /><el-table-column prop="action" label="事件" width="80" /><el-table-column prop="key" label="key" min-width="100" /><el-table-column prop="code" label="code" min-width="140" /><el-table-column prop="keyCode" label="keyCode" width="100" /></el-table>
    </section>
    <ToolDetail title="说明"><el-text>实时显示键盘按下和松开事件，记录 event.key、event.code 和 keyCode，并标记已测试的按键。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.keyboard { overflow-x: auto; padding: 20px; border: 1px solid var(--app-border); border-radius: 12px; background: var(--app-surface-muted); }
.keyboard-row { display: flex; min-width: 720px; gap: 5px; margin-bottom: 5px; }.key { min-width: 0; height: 44px; display: grid; place-items: center; border: 1px solid var(--app-border); border-radius: 6px; background: var(--app-surface); color: var(--app-text); font-size: 12px; }.key.tested { border-color: var(--el-color-primary-light-5); }.key.active { background: var(--el-color-primary); color: #fff; }
.last-event { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 16px; padding: 12px; border-radius: 10px; background: var(--app-surface-muted); color: var(--app-text); }.last-event code { color: var(--app-text-muted); }
h3 { color: var(--app-text); font-size: 16px; }
</style>
