<script setup lang="ts">
import { ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import * as prettier from 'prettier/standalone'
import babel from 'prettier/plugins/babel'
import estree from 'prettier/plugins/estree'
import html from 'prettier/plugins/html'
import postcss from 'prettier/plugins/postcss'
import typescript from 'prettier/plugins/typescript'
import markdown from 'prettier/plugins/markdown'
import yaml from 'prettier/plugins/yaml'
import graphql from 'prettier/plugins/graphql'
import { format as formatSql } from 'sql-formatter'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

type Language = 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'html' | 'css' | 'json' | 'markdown' | 'yaml' | 'graphql' | 'sql'
const languages: { value: Language; label: string; parser: string; extension: string }[] = [
  { value: 'javascript', label: 'JavaScript', parser: 'babel', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', parser: 'typescript', extension: 'ts' },
  { value: 'jsx', label: 'JSX', parser: 'babel', extension: 'jsx' },
  { value: 'tsx', label: 'TSX', parser: 'typescript', extension: 'tsx' },
  { value: 'html', label: 'HTML', parser: 'html', extension: 'html' },
  { value: 'css', label: 'CSS', parser: 'css', extension: 'css' },
  { value: 'json', label: 'JSON', parser: 'json', extension: 'json' },
  { value: 'markdown', label: 'Markdown', parser: 'markdown', extension: 'md' },
  { value: 'yaml', label: 'YAML', parser: 'yaml', extension: 'yaml' },
  { value: 'graphql', label: 'GraphQL', parser: 'graphql', extension: 'graphql' },
  { value: 'sql', label: 'SQL', parser: 'sql', extension: 'sql' },
]
const plugins = [babel, estree, html, postcss, typescript, markdown, yaml, graphql]
const language = ref<Language>('javascript')
const input = ref('')
const output = ref('')
const error = ref('')
const busy = ref(false)
const tabWidth = ref(2)

async function formatCode() {
  output.value = ''
  error.value = ''
  if (!input.value.trim()) { error.value = '请先输入代码'; return }
  busy.value = true
  try {
    output.value = language.value === 'sql'
      ? formatSql(input.value, { tabWidth: tabWidth.value })
      : await prettier.format(input.value, {
          parser: languages.find(item => item.value === language.value)!.parser,
          plugins,
          tabWidth: tabWidth.value,
          printWidth: 100,
        })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '格式化失败'
  } finally {
    busy.value = false
  }
}

function download() {
  if (!output.value) return
  const extension = languages.find(item => item.value === language.value)!.extension
  const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `formatted.${extension}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function loadExample() {
  const examples: Record<Language, string> = {
    javascript: 'function add(a,b){return a+b}',
    typescript: 'function greet(name:string):string{return `Hello, ${name}`}',
    jsx: 'const App=()=> <div><h1>Hello</h1></div>',
    tsx: 'const App=({name}:{name:string})=><div>{name}</div>',
    html: '<div><h1>Hello</h1><p>Web-Tools</p></div>',
    css: '.box{display:flex;color:#3478f6;padding:8px}',
    json: '{"name":"web","enabled":true}',
    markdown: '# 标题\n- 第一项\n- 第二项',
    yaml: 'server:\n  host: localhost\n  port: 8080',
    graphql: 'type Query { user(id: ID!): User } type User { id: ID! name: String! }',
    sql: 'select id,name from users where enabled=1 order by name;',
  }
  input.value = examples[language.value]
  output.value = ''
  error.value = ''
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <span class="tool-workbench__label" style="margin: 0">语言</span>
        <el-select v-model="language" style="width: 160px" @change="output = ''; error = ''">
          <el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="tool-workbench__label" style="margin: 0">缩进</span>
        <el-select v-model="tabWidth" style="width: 100px">
          <el-option label="2 空格" :value="2" />
          <el-option label="4 空格" :value="4" />
        </el-select>
        <el-button @click="loadExample">示例</el-button>
        <el-button @click="input = ''; output = ''; error = ''">清空</el-button>
        <el-button type="primary" :loading="busy" @click="formatCode">格式化</el-button>
      </div>
      <div class="tool-workbench__grid">
        <div class="tool-workbench__field">
          <label class="tool-workbench__label">输入代码</label>
          <codemirror v-model="input" placeholder="在这里输入或粘贴代码" :style="{ height: '400px' }" />
        </div>
        <div class="tool-workbench__field">
          <div class="tool-workbench__row" style="justify-content: space-between; margin-bottom: 9px">
            <span class="tool-workbench__label" style="margin: 0">格式化结果</span>
            <div class="tool-workbench__row" style="margin: 0">
              <el-button size="small" :disabled="!output" @click="copy(output)">复制</el-button>
              <el-button size="small" :disabled="!output" @click="download">下载</el-button>
            </div>
          </div>
          <pre class="tool-workbench__output">{{ output }}</pre>
          <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
        </div>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>使用 Prettier 格式化 JavaScript、TypeScript、JSX、TSX、HTML、CSS、JSON、Markdown、YAML 和 GraphQL；SQL 使用项目现有的 SQL Formatter。格式化失败时保留原文。</el-text></ToolDetail>
  </div>
</template>
