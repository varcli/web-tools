<script setup lang="ts">
// 齿轮轮廓，8 齿，外径 33 / 齿根 26，围绕 88×88 画布中心
const GEAR_PATH =
  'M37.14 11.72L50.86 11.72L53.95 19.98L61.97 16.32L71.68 26.03L68.02 34.05L76.28 37.14L76.28 50.86L68.02 53.95L71.68 61.97L61.97 71.68L53.95 68.02L50.86 76.28L37.14 76.28L34.05 68.02L26.03 71.68L16.32 61.97L19.98 53.95L11.72 50.86L11.72 37.14L19.98 34.05L16.32 26.03L26.03 16.32L34.05 19.98Z'
</script>

<template>
  <svg class="app-logo" viewBox="0 0 88 88" role="img" aria-label="Web-Tools" focusable="false">
    <path :d="GEAR_PATH" fill="currentColor" />
    <circle cx="44" cy="44" r="19" fill="var(--app-surface, #fff)" />
    <path
      d="M38 37 L31 44 L38 51 M50 37 L57 44 L50 51 M47 34.5 L41 53.5"
      fill="none"
      stroke="currentColor"
      stroke-width="3.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.app-logo {
  display: block;
  width: 100%;
  height: 100%;
  color: var(--el-color-primary);
}
</style>
