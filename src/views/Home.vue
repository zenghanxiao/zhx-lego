<script setup lang="ts">
import TemplateList from '@/components/TemplateList.vue'
import { useCounterStore } from '@/stores/counter'
import type { TemplateProps } from '@/stores/templates'

const testData: TemplateProps[] = []

const counterStore = useCounterStore()
</script>

<template>
  <div class="content-container">
    <a-row :gutter="16">
      <template-list :list="testData"></template-list>
    </a-row>
    <a-row type="flex" justify="center">
      <!-- <a-button
        type="primary"
        size="large"
        @click="loadMorePage"
        v-if="!isLastPage"
        :loading="isLoading"
        >加载更多</a-button
      > -->
      <span>{{ counterStore.count }}</span>
      <span>{{ counterStore.doubleCount }}</span>
      <a-button type="primary" size="large" @click="counterStore.increment">+</a-button>
    </a-row>
  </div>
</template>

<style scoped>
.page-title {
  color: #fff;
}
.content-container {
  background: #fff;
  padding: 0 24px 24px 30px;
  min-height: 85vh;
  max-width: 1200px;
  margin: 50px auto;
  width: 100%;
}
</style>
