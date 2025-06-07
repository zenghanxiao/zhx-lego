<script setup lang="ts">
import { textDefaultProps, type TextComponentProps } from '@/types/defaultProps'
import { mapPropsToForms, type PropsToForms } from '@/utils/propsMap'
import { reduce } from 'lodash-es'
import { computed, shallowReactive, type Component } from 'vue'
import { Input as AInput } from 'ant-design-vue'

interface IProps {
  cProps: Partial<TextComponentProps>
}

const props = defineProps<IProps>()

const allTextProps = computed(() => {
  return { ...textDefaultProps, ...props.cProps }
})

const componentsMap = shallowReactive<Record<string, Component>>({
  'a-input': AInput,
})

const finalProps = computed(() => {
  return reduce(
    allTextProps.value,
    (result, value, key) => {
      const newKey = key as keyof TextComponentProps
      const item = mapPropsToForms[newKey]
      if (item) {
        item.value = value
        result[newKey] = item
      }
      return result
    },
    {} as PropsToForms,
  )
})
</script>

<template>
  <div class="props-table">
    <div v-for="(value, index) in finalProps" :key="index" class="prop-item">
      <component
        v-if="value"
        :is="componentsMap[value.component] || value.component"
        :value="value.value"
      />
    </div>
  </div>
</template>

<style scoped>
.prop-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.label {
  width: 28%;
}
.prop-component {
  width: 70%;
}
.prop-item.no-text {
  display: inline-block;
  margin: 0 10px 0 0;
}
#item-fontWeight {
  margin-left: 28%;
}
.component-a-select .ant-select {
  width: 150px;
}
.prop-component.component-shadow-picker,
.prop-component.component-image-processer,
.prop-component.component-background-processer {
  width: 100%;
}
</style>
