<script setup lang="ts">
import '../workbench.css'
import { reactive } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
const info = reactive({
  title: "UUID生成器",
  resStr: '',
  pwNum: 1,
  autosize: {
    minRows: 5
  },
})

//生成
const gen = () => {
  //生成数量验证
  if (info.pwNum > 100) {
    ElMessage({
      message: "生成数量范围在1~100",
      type: "warning",
      duration: 1500
    })
    return
  }
  //清空旧数据
  info.resStr = ''

  //按数量生成密码
  for (let i = 1; i <= info.pwNum; i++) {
    let ext = '\n'
    if (i == info.pwNum) {
      ext = ''
    }
    info.resStr += uuidv4() + ext
  }
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar"><el-button type="primary" @click="gen">生成 UUID</el-button></div>
      <div>
        <el-input v-model="info.pwNum" placeholder="范围1~100" class="" max="100" type="number">
          <template #prepend>生成数量:</template>
        </el-input>
      </div>
      <!-- res -->
      <div class="tool-workbench__result">
        <div class="tool-workbench__toolbar"><span class="tool-workbench__label">生成结果</span><span class="tool-workbench__toolbar-spacer"></span><el-button :disabled="!info.resStr" @click="copyRes(info.resStr)">复制全部</el-button></div>
        <el-input type="textarea" :autosize="info.autosize" v-model="info.resStr" readonly />
      </div>
    </section>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线UUID批量生成
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>
