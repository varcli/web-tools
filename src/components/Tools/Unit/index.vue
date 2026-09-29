<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { useRoute } from "vue-router"
import Length from './components/Length.vue'
import Area from './components/Area.vue'
import Heat from './components/Heat.vue'
import Power from './components/Power.vue'
import Pressure from './components/Pressure.vue'
import Temperature from './components/Temperature.vue'
import Time from './components/Time.vue'
import Weight from './components/Weight.vue'
import '../workbench.css'
const info = reactive({
  title: "单位转换",
  activeName: 'lengthTab',
})

const route = useRoute()

onMounted(() => {
  if (route.query.active) {
    switch (route.query.active) {
      case 'area':
        info.activeName = 'areaTab'
        break;
      case 'weight':
        info.activeName = 'weightTab'
        break;
      case 'time':
        info.activeName = 'timeTab'
        break;
      case 'temperature':
        info.activeName = 'temperatureTab'
        break;
      case 'pressure':
        info.activeName = 'pressureTab'
        break;
      case 'heat':
        info.activeName = 'heatTab'
        break;
      case 'power':
        info.activeName = 'powerTab'
        break
      default:
        info.activeName = 'lengthTab'
        break;
    }
  }
})
</script>

<template>
  <div class="tool-workbench unit-workbench">
    <section class="tool-workbench__panel">
        <el-tabs v-model="info.activeName" class="unit-workbench__tabs">
          <el-tab-pane label="长度" name="lengthTab">
            <Length/>
          </el-tab-pane>
          <el-tab-pane label="面积" name="areaTab">
            <Area/>
          </el-tab-pane>
          <el-tab-pane label="重量" name="weightTab">
            <Weight/>
          </el-tab-pane>
          <el-tab-pane label="时间" name="timeTab">
            <Time/>
          </el-tab-pane>
          <el-tab-pane label="温度" name="temperatureTab">
            <Temperature/>
          </el-tab-pane>
          <el-tab-pane label="压力" name="pressureTab">
            <Pressure/>
          </el-tab-pane>
          <el-tab-pane label="热量" name="heatTab">
            <Heat/>
          </el-tab-pane>
          <el-tab-pane label="功率" name="powerTab">
            <Power/>
          </el-tab-pane>
        </el-tabs>
    </section>

    <ToolDetail title="说明">
      <el-text>
        在线单位换算、长度单位换算、面积单位换算、时间单位换算、温度单位换算、压力单位换算、热量单位换算、功率单位换算。
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.unit-workbench__tabs { min-width: 0; }
.unit-workbench__tabs :deep(.el-tab-pane) { min-width: 0; }
.unit-workbench :deep(.custom-box) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
  min-width: 0;
}
.unit-workbench :deep(.custom-box-single) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: auto;
  min-width: 0;
}
.unit-workbench :deep(.custom-box-text) {
  flex: 0 0 116px;
  width: 116px;
  text-align: right;
}
.unit-workbench :deep(.custom-box-single > .el-input) { min-width: 0; }
@media (max-width: 760px) {
  .unit-workbench :deep(.custom-box) { grid-template-columns: minmax(0, 1fr); }
  .unit-workbench :deep(.custom-box-text) { flex-basis: 96px; width: 96px; }
}
@media (max-width: 480px) {
  .unit-workbench :deep(.custom-box-single) { flex-wrap: wrap; gap: 4px; }
  .unit-workbench :deep(.custom-box-text) { flex: 0 0 100%; width: 100%; text-align: left; }
  .unit-workbench :deep(.custom-box-single > .el-input) { width: 100%; }
}
</style>
