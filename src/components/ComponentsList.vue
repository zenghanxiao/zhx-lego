<script setup lang="ts">
import LText from '@/components/LText.vue'
import type { ComponentData } from '@/stores/editor'
import type { TextComponentProps } from '@/types/defaultProps'
import { v4 as uuidv4 } from 'uuid'

interface IProps {
  list: Partial<TextComponentProps>[]
}
defineProps<IProps>()

interface IEmits {
  (e: 'on-item-click', value: ComponentData): void
}

const emits = defineEmits<IEmits>()

const onItemClick = (props: Partial<TextComponentProps>) => {
  const componentData: ComponentData = {
    name: 'l-text',
    id: uuidv4(),
    props,
  }
  emits('on-item-click', componentData)
}
</script>

<template>
  <div class="create-component-list">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="component-item"
      @click="onItemClick(item)"
    >
      <l-text v-bind="item"></l-text>
    </div>
  </div>
</template>

<style scoped>
.component-item {
  width: 100px;
  margin: 0 auto;
  margin-bottom: 15px;
}
.component-item > * {
  position: static !important;
}
</style>
