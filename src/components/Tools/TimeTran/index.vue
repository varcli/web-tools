<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import TimestampPanel from './components/TimestampPanel.vue'
import DateCalculator from './components/DateCalculator.vue'
import TimezoneConverter from './components/TimezoneConverter.vue'
import '../workbench.css'
import './time-tools.css'

const tab = ref('timestamp')
</script>

<template>
  <div class="tool-workbench time-tools">
    
    <section class="tool-workbench__panel">
      <el-tabs v-model="tab">
        <el-tab-pane label="时间戳转换" name="timestamp"><TimestampPanel /></el-tab-pane>
        <el-tab-pane label="日期计算" name="date"><DateCalculator /></el-tab-pane>
        <el-tab-pane label="时区转换" name="timezone"><TimezoneConverter /></el-tab-pane>
      </el-tabs>
    </section>
    <ToolDetail title="说明"><el-text>转换 Unix 时间戳，计算日期差值与日期加减，并按指定时区转换时间。时间戳和日期计算使用浏览器本地时区；时区转换以选择的源时区为准。</el-text></ToolDetail>
  </div>
</template>
