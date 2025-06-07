<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ref, shallowReactive } from 'vue'
import type { Component } from 'vue'
import ComponentsList from '@/components/ComponentsList.vue'
import LText from '@/components/LText.vue'
import defaultTextTemplates from '@/utils/defaultTemplates'

const componentsMap = shallowReactive<Record<string, Component>>({
  'l-text': LText,
})

const editorStore = useEditorStore()

const canvasFix = ref(false)

const addItem = () => {}
</script>

<template>
  <div class="editor-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/" class="logo-wrap">
            <img alt="慕课乐高" src="../assets/logo-simple.png" class="logo-img" />
          </router-link>
        </div>
        <a-menu :selectable="false" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
        </a-menu>
      </a-layout-header>
    </a-layout>
    <a-layout>
      <a-layout-sider width="300" style="background: #fff">
        <div class="sidebar-container">
          组件列表
          <components-list :list="defaultTextTemplates" @onItemClick="addItem" />
          <img id="test-image" :style="{ width: '300px' }" />
        </div>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-layout-content class="preview-container">
          <p>画布区域</p>
          <div class="preview-list" id="canvas-area" :class="{ 'canvas-fix': canvasFix }">
            <div class="body-container">
              <component
                v-for="component in editorStore.components"
                :key="component.id"
                :is="componentsMap[component.name]"
                v-bind="component.props"
              />
            </div>
          </div>
        </a-layout-content>
      </a-layout>
      <a-layout-sider width="300" style="background: #fff" class="settings-panel"> </a-layout-sider>
    </a-layout>
  </div>
</template>

<style scoped>
.editor-container .preview-container {
  padding: 24px;
  margin: 0;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.editor-container .preview-list {
  padding: 0;
  margin: 0;
  min-width: 375px;
  min-height: 200px;
  border: 1px solid #efefef;
  background: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  margin-top: 50px;
  max-height: 80vh;
}
.page-title {
  height: 100%;
  display: flex;
  align-items: center;
}
.page-title .logo-wrap {
  height: 44px;
}
.page-title .inline-edit span {
  font-weight: 500;
  margin-left: 10px;
  font-size: 16px;
}
.preview-list.canvas-fix .edit-wrapper > * {
  box-shadow: none !important;
}
.preview-list.canvas-fix {
  position: absolute;
  max-height: none;
}
</style>
