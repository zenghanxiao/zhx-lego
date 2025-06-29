<script setup lang="ts">
import { textDefaultProps, type TextComponentProps } from '@/types/defaultProps'
import { mapPropsToForms } from '@/utils/propsMap.tsx'
import { reduce } from 'lodash-es'
import { computed, shallowReactive, type Component, type VNode } from 'vue'
import {
  InputNumber as AInputNumber,
  Slider as ASlider,
  Textarea as ATextarea,
  Select as ASelect,
  SelectOption as ASelectOption,
  RadioGroup as ARadioGroup,
  RadioButton as ARadioButton,
} from 'ant-design-vue'

import RenderVnode from './RenderVnode.ts'
import ColorPicker from './ColorPicker.vue'

interface FormProps {
  component: string
  subComponent?: string
  value: string
  extraProps?: { [key: string]: any }
  text?: string
  options?: { text: string | VNode; value: any }[]
  valueProp: string
  eventName: string
  events: { [key: string]: (e: any) => void }
}

interface IProps {
  cProps: Partial<TextComponentProps>
}

const props = defineProps<IProps>()

interface IEmits {
  (e: 'change', value: { key: string; value: any }): void
}

const emits = defineEmits<IEmits>()

const allTextProps = computed(() => {
  return { ...textDefaultProps, ...props.cProps }
})

const componentsMap = shallowReactive<Record<string, Component>>({
  'a-textarea': ATextarea,
  'a-input-number': AInputNumber,
  'a-slider': ASlider,
  'a-select': ASelect,
  'a-select-option': ASelectOption,
  'a-radio-group': ARadioGroup,
  'a-radio-button': ARadioButton,
  'color-picker': ColorPicker,
})

const finalProps = computed(() => {
  return reduce(
    allTextProps.value,
    (result, value, key) => {
      const newKey = key as keyof TextComponentProps
      const item = mapPropsToForms[newKey]
      if (item) {
        const { valueProp = 'value', eventName = 'change', initalTransform, afterTransform } = item
        const newItem: FormProps = {
          ...item,
          value: initalTransform ? initalTransform(value) : value,
          valueProp,
          eventName,
          events: {
            [eventName]: (e: any) => {
              emits('change', { key, value: afterTransform ? afterTransform(e) : e })
            },
          },
        }
        result[newKey] = newItem
      }
      return result
    },
    {} as { [key: string]: FormProps },
  )
})
</script>

<template>
  <div class="props-table">
    <div
      v-for="(value, index) in finalProps"
      :key="index"
      :class="{ 'no-text': !value.text }"
      class="prop-item"
      :id="`item-${index}`"
    >
      <span class="label" v-if="value.text">{{ value.text }}</span>
      <div :class="`prop-component component-${value.component}`">
        <component
          :is="componentsMap[value.component] || value.component"
          :[value.valueProp]="value.value"
          v-bind="value.extraProps"
          v-on.passive:false="value.events"
        >
          <template v-if="value.options && value.subComponent">
            <component
              :is="componentsMap[value.subComponent] || value.subComponent"
              v-for="(option, k) in value.options"
              :key="k"
              :value="option.value"
            >
              <render-vnode :vNode="option.text"></render-vnode>
            </component>
          </template>
        </component>
      </div>
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
