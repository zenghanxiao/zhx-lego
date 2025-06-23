import type { AllComponentProps } from '@/types/defaultProps'
import { omit } from 'lodash-es'
import { computed } from 'vue'

export const useRestProps = (props: Readonly<Partial<AllComponentProps>>, omits: string[]) => {
  const restProps = computed(() => {
    return omit(props, omits)
  })
  return { restProps }
}
