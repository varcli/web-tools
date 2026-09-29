<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import html2canvas from 'html2canvas'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { saveBlob } from '@/utils/gif'
import '../workbench.css'

type ChatItem = { id: string; sender: 'me' | 'them'; type: 'text' | 'redpacket' | 'time'; text: string }
const messages = ref<ChatItem[]>([
  { id: '1', sender: 'them', type: 'time', text: '今天 09:30' },
  { id: '2', sender: 'them', type: 'text', text: '周末有时间吗？' },
  { id: '3', sender: 'me', type: 'text', text: '有，一起喝咖啡吧 ☕' },
])
const name = ref('聊天对象')
const phoneTime = ref('09:41')
const battery = ref(88)
const sender = ref<'me' | 'them'>('them')
const type = ref<'text' | 'redpacket' | 'time'>('text')
const text = ref('')
const meAvatar = ref('')
const themAvatar = ref('')
const exporting = ref(false)
const error = ref('')
const phone = ref<HTMLElement | null>(null)
function avatarUpload(target: 'me' | 'them', file: UploadFile) {
  if (!file.raw) return
  const state = target === 'me' ? meAvatar : themAvatar
  if (state.value) URL.revokeObjectURL(state.value)
  state.value = URL.createObjectURL(file.raw)
}
onBeforeUnmount(() => { if (meAvatar.value) URL.revokeObjectURL(meAvatar.value); if (themAvatar.value) URL.revokeObjectURL(themAvatar.value) })
function add() { if (!text.value.trim()) return; messages.value.push({ id: crypto.randomUUID(), sender: sender.value, type: type.value, text: text.value.trim() }); text.value = '' }
function move(index: number, offset: number) { const next = index + offset; if (next < 0 || next >= messages.value.length) return; const [item] = messages.value.splice(index, 1); messages.value.splice(next, 0, item) }
async function exportPng() {
  if (!phone.value) return
  exporting.value = true; error.value = ''
  try {
    const canvas = await html2canvas(phone.value, { scale: 2, useCORS: true, backgroundColor: '#ededed' })
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('截图生成失败'))))
    saveBlob(blob, 'chat-preview.png')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '导出失败' }
  finally { exporting.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-input v-model="name" placeholder="聊天对象名称" style="max-width: 180px" /><el-input v-model="phoneTime" placeholder="状态栏时间" style="max-width: 110px" /><span>电量</span><el-input-number v-model="battery" :min="0" :max="100" /><el-upload accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="file => avatarUpload('them', file)"><el-button>对方头像</el-button></el-upload><el-upload accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="file => avatarUpload('me', file)"><el-button>我的头像</el-button></el-upload><el-button type="primary" :loading="exporting" @click="exportPng">导出 PNG</el-button></div><div class="tool-workbench__grid layout"><div class="editor"><div class="tool-workbench__row"><el-select v-model="type" style="width: 115px"><el-option label="文字" value="text" /><el-option label="红包" value="redpacket" /><el-option label="时间" value="time" /></el-select><el-select v-if="type !== 'time'" v-model="sender" style="width: 110px"><el-option label="对方" value="them" /><el-option label="我" value="me" /></el-select></div><el-input v-model="text" type="textarea" :rows="3" :placeholder="type === 'time' ? '输入时间分隔文字' : type === 'redpacket' ? '输入红包祝福语' : '输入聊天内容'" /><el-button type="primary" style="margin: 10px 0 18px" @click="add">添加消息</el-button><div v-for="(item, index) in messages" :key="item.id" class="message-edit"><el-tag size="small">{{ item.type === 'time' ? '时间' : item.sender === 'me' ? '我' : '对方' }}</el-tag><el-input v-model="item.text" size="small" /><el-button size="small" :disabled="index === 0" @click="move(index, -1)">↑</el-button><el-button size="small" :disabled="index === messages.length - 1" @click="move(index, 1)">↓</el-button><el-button size="small" type="danger" plain @click="messages.splice(index, 1)">删</el-button></div></div><div class="phone-wrap"><div ref="phone" class="phone"><div class="status"><strong>{{ phoneTime }}</strong><span>●●● 5G ▰ {{ battery }}%</span></div><div class="chat-header">‹ <strong>{{ name }}</strong><span>···</span></div><div class="chat-body"><template v-for="item in messages" :key="item.id"><div v-if="item.type === 'time'" class="time">{{ item.text }}</div><div v-else class="bubble-row" :class="item.sender"><div class="avatar"><img v-if="item.sender === 'me' ? meAvatar : themAvatar" :src="item.sender === 'me' ? meAvatar : themAvatar" alt="头像" /><span v-else>{{ item.sender === 'me' ? '我' : (name[0] || 'TA') }}</span></div><div class="bubble" :class="{ redpacket: item.type === 'redpacket' }"><template v-if="item.type === 'redpacket'">🧧 {{ item.text }}<small>微信红包</small></template><template v-else>{{ item.text }}</template></div></div></template></div><div class="chat-footer">⊕ <span>发送消息</span> ☺ ＋</div></div></div></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>编辑聊天内容、头像、时间和红包消息，预览后导出 PNG 图片。仅用于设计演示。</el-text></ToolDetail></div>
</template>
<style scoped>.layout { grid-template-columns: minmax(0,1fr) minmax(320px,430px); }.message-edit { display: flex; align-items: center; gap: 5px; margin: 6px 0; }.message-edit :deep(.el-button+.el-button) { margin-left: 0; }.message-edit .el-input { flex: 1; min-width: 0; }.phone-wrap { display: flex; justify-content: center; }.phone { width: 375px; min-height: 660px; display: flex; flex-direction: column; overflow: hidden; border: 8px solid #202329; border-radius: 34px; background: #ededed; color: #171717; box-shadow: 0 12px 32px #0002; }.status { display: flex; justify-content: space-between; padding: 12px 24px 4px; background: #f5f5f5; font-size: 12px; }.chat-header { display: flex; align-items: center; gap: 14px; padding: 10px 16px; background: #f5f5f5; border-bottom: 1px solid #ddd; font-size: 22px; }.chat-header strong { flex: 1; font-size: 16px; text-align: center; }.chat-body { flex: 1; padding: 15px 12px; }.time { margin: 12px 0; color: #999; text-align: center; font-size: 12px; }.bubble-row { display: flex; align-items: start; gap: 8px; margin: 13px 0; }.bubble-row.me { flex-direction: row-reverse; }.avatar { width: 36px; height: 36px; flex: none; display: grid; place-items: center; overflow: hidden; border-radius: 5px; background: #7fc7f2; color: #fff; font-size: 14px; }.bubble-row.them .avatar { background: #f2a46a; }.avatar img { width: 100%; height: 100%; object-fit: cover; }.bubble { max-width: 72%; padding: 9px 12px; border-radius: 8px; background: white; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 1.5; }.me .bubble { background: #95ec69; }.bubble.redpacket { min-width: 155px; color: #fff; background: #f5a443; }.bubble.redpacket small { display: block; margin-top: 12px; padding-top: 5px; border-top: 1px solid #fff6; font-size: 11px; }.chat-footer { display: flex; align-items: center; gap: 8px; padding: 10px 14px 18px; border-top: 1px solid #ddd; background: #f7f7f7; font-size: 20px; }.chat-footer span { flex: 1; padding: 5px; border-radius: 6px; background: white; color: #aaa; font-size: 13px; }@media (max-width: 850px){.layout{grid-template-columns:1fr}.phone{max-width:100%}}</style>
