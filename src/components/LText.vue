<script setup lang="ts">
import { textDefaultProps, type TextComponentProps } from '@/types/defaultProps'
import { handleClick } from '@/utils'
import { useRestProps } from '@/hooks/useRestProps'

interface IProps {
  tag: string
}
type LProps = IProps & TextComponentProps
const props = withDefaults(defineProps<Partial<LProps>>(), {
  tag: 'div',
  ...textDefaultProps,
})

const { restProps: styleProps } = useRestProps(props, ['tag', 'url', 'text', 'actionType'])
</script>

<template>
  <component :is="tag" class="l-text-component" :style="styleProps" @click="handleClick(props)">
    {{ text }}
  </component>
</template>

<style scoped>
h2.l-text-component,
p.l-text-component {
  margin-bottom: 0;
}
button.l-text-component {
  padding: 5px 10px;
  cursor: pointer;
}
.l-text-component {
  box-sizing: border-box;
  white-space: pre-wrap;
  position: relative !important;
}
</style>
