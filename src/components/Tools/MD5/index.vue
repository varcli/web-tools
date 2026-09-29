<script setup lang="ts">
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Md5 } from 'ts-md5'
import { copy } from '@/utils/string'
import '../workbench.css'
const info = reactive({
  title: "MD5在线加密",
  encryptStr: '',
  encryptUpper32: '',
  encryptLower32: '',
  encryptUpper16: '',
  encryptLower16: '',
})

//加密
const encrypt = () => {
  info.encryptLower32 = Md5.hashStr(info.encryptStr)
  info.encryptUpper32 = info.encryptLower32.toUpperCase()
  info.encryptUpper16 = info.encryptUpper32.substring(8, 24)
  info.encryptLower16 = info.encryptLower32.substring(8, 24)
}

//清空输入框
const clear = () => {
  info.encryptStr = ''
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="encrypt()">加密</el-button>
        <el-button @click="clear()">清空输入框</el-button>
      </div>
      <div class="tool-workbench__editor">
        <label class="tool-workbench__label">输入内容</label>
        <el-input v-model="info.encryptStr" :rows="5" type="textarea" placeholder="请输入加密内容"></el-input>
      </div>

      <div class="tool-workbench__result">
        <el-input :value="info.encryptUpper32" class="mt-4" readonly>
          <template #prepend>
            <el-text>32位大写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper32)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower32" class="mt-2" readonly>
          <template #prepend>
            <el-text>32位小写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower32)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptUpper16" class="mt-2" readonly>
          <template #prepend>
            <el-text>16位大写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper16)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower16" class="mt-2" readonly>
          <template #prepend>
            <el-text>16位小写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower16)">复制</el-button>
          </template>
        </el-input>
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线md5加密,md5加密算法,md5加密工具,免费MD5在线加密,可生成32位md5,16位md5
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>
