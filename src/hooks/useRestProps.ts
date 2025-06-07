import { omit } from 'lodash-es'
import { computed } from 'vue'

export const useRestProps = <T extends { [key: string]: any }>(props: T, omits: string[]) => {
  const restProps = computed(() => {
    return omit(props, omits)
  })
  return { restProps }
}
