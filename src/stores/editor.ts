import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TextComponentProps } from '@/types/defaultProps'

export interface ComponentData {
  // 这个元素的 属性，属性请详见下面
  // props: Partial<AllComponentProps>;
  props: Partial<TextComponentProps>
  // id，uuid v4 生成
  id: string
  // 业务组件库名称 l-text，l-image 等等
  name: 'l-text' | 'l-image' | 'l-shape'
  // 图层是否隐藏
  isHidden?: boolean
  // 图层是否锁定
  isLocked?: boolean
  // 图层名称
  layerName?: string
}

export interface EditorProps {
  // 供中间编辑器渲染的数组
  components: ComponentData[]
  // 当前编辑的是哪个元素，uuid
  currentElement: string
  // 当然最后保存的时候还有有一些项目信息，这里并没有写出，等做到的时候再补充
  page: PageData
  // 当前被复制的组件
  copiedComponent?: ComponentData
  // 当前操作的历史记录
  // histories: HistoryProps[];
  // 当前历史记录的操作位置
  historyIndex: number
  // 开始更新时的缓存值
  cachedOldValues: any
  // 保存最多历史条目记录数
  maxHistoryNumber: number
  // 数据是否有修改
  isDirty: boolean
  // 当前 work 的 channels
  // channels: ChannelProps[];
}

export interface PageProps {
  backgroundColor: string
  backgroundImage: string
  backgroundRepeat: string
  backgroundSize: string
  height: string
}

export interface PageData {
  id?: number
  props?: PageProps
  title?: string
  desc?: string
  coverImg?: string
  uuid?: string
  setting?: { [key: string]: any }
  isTemplate?: boolean
  isHot?: boolean
  isNew?: boolean
  author?: string
  copiedCount?: number
  status?: number
  user?: {
    gender: string
    nickName: string
    picture: string
    userName: string
  }
}

export const testCompoents: ComponentData[] = [
  { id: uuidv4(), name: 'l-text', props: { text: 'hello', fontSize: '20px', color: '#ff0000' } },
  { id: uuidv4(), name: 'l-text', props: { text: 'hello2', fontSize: '10px', lineHeight: '2' } },
  { id: uuidv4(), name: 'l-text', props: { text: 'hello3', fontSize: '15px', fontWeight: 'bold' } },
]

export const useEditorStore = defineStore('editor', () => {
  const components = ref<ComponentData[]>(testCompoents)
  const currentElement = ref<string>('')

  const getCurrentElement = computed(() => {
    return components.value.find((item) => {
      return item.id === currentElement.value
    })
  })

  function addComponent(component: ComponentData) {
    components.value.push(component)
  }

  function deleteComponent(id: string) {
    const index = components.value.findIndex((item) => {
      return item.id === id
    })
    if (index > -1) {
      components.value.splice(index, 1)
      message.success('删除当前图层成功', 1)
    }
  }

  function setActive(id: string) {
    currentElement.value = id
  }

  function updatePage({ key, value }: { key: string; value: string }) {
    const curEle = components.value.find((item) => {
      return item.id === currentElement.value
    })
    if (curEle) {
      curEle.props[key as keyof TextComponentProps] = value
    }
  }

  return {
    components,
    currentElement,
    getCurrentElement,
    addComponent,
    deleteComponent,
    setActive,
    updatePage,
  }
})
