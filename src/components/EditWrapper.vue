<script setup lang="ts">
import { ref } from 'vue'

interface IProps {
  id: string
  active?: boolean
}

withDefaults(defineProps<IProps>(), {
  active: false,
})

interface IEmits {
  (e: 'set-active', id: string): void
}

const emits = defineEmits<IEmits>()

const editWrapperRef = ref<HTMLElement | null>(null)

const onItemClick = (id: string) => {
  emits('set-active', id)
}
</script>

<template>
  <div
    class="edit-wrapper"
    :class="{ active: active }"
    ref="editWrapperRef"
    @click="onItemClick(id)"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.edit-wrapper {
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
  box-sizing: content-box !important;
}
.edit-wrapper > * {
  position: static !important;
  width: 100% !important;
  height: 100% !important;
}
.edit-wrapper:hover {
  border: 1px dashed #ccc;
}
.edit-wrapper.hidden {
  display: none;
}
.edit-wrapper.active {
  border: 1px solid #1890ff;
  user-select: none;
  z-index: 1500;
}
.edit-wrapper .resizers {
  display: none;
}
.edit-wrapper.active .resizers {
  display: block;
}
.edit-wrapper.active .resizers .resizer {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #1890ff;
  position: absolute;
}
.edit-wrapper .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize;
}
.edit-wrapper .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
