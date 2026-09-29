//创建tools相关的小工具
import { defineStore } from 'pinia'
import { getTools, getToolsCate } from '@/components/Tools/tools.ts'
import type { ToolsReqData, ToolsInfo } from '@/components/Tools/tools.type.ts'

// 收藏工具列表存储键名
const COLLECTED_TOOLS_KEY = 'collected_tools';

export const useToolsStore = defineStore('tools', {
  //用来存放变量
  state: () => ({
    list: [] as ToolsInfo[],
    cates: [] as any[],
    recommends: [] as ToolsInfo[],
    collectedTools: [] as ToolsInfo[],
  }),
  //方法
  actions: {
    //获取tools
    async getTools(data: ToolsReqData) {
      //发送请求
      const result: any = await getTools(data)
      this.list = result
      return result
    },
    //获取tools cate
    async getToolCate() {
      //发送请求
      this.cates = await getToolsCate()
    },
    // 加载收藏工具
    loadCollectedTools() {
      try {
        const stored = localStorage.getItem(COLLECTED_TOOLS_KEY);
        if (stored) {
          this.collectedTools = JSON.parse(stored);
        }
      } catch (error) {
        console.error('加载收藏工具失败:', error);
        this.collectedTools = [];
      }
    },
    // 保存收藏工具到本地存储
    saveCollectedTools() {
      try {
        localStorage.setItem(COLLECTED_TOOLS_KEY, JSON.stringify(this.collectedTools));
      } catch (error) {
        console.error('保存收藏工具失败:', error);
      }
    },
    // 添加收藏
    addCollect(tool: ToolsInfo) {
      // 检查是否已经收藏
      const isCollected = this.collectedTools.some(t => t.url === tool.url);
      if (!isCollected) {
        this.collectedTools.push(tool);
        this.saveCollectedTools();
        return true;
      }
      return false;
    },
    // 移除收藏
    removeCollect(url: string) {
      const index = this.collectedTools.findIndex(tool => tool.url === url);
      if (index > -1) {
        this.collectedTools.splice(index, 1);
        this.saveCollectedTools();
        return true;
      }
      return false;
    },
    // 检查是否已收藏
    isCollected(url: string) {
      const normalizedUrl = url.replace(/\/$/, '');
      return this.collectedTools.some(tool => {
        const toolUrl = tool.url.replace(/\/$/, '');
        return toolUrl === normalizedUrl;
      });
    },
  }
})
