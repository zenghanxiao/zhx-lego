import type { TextComponentProps } from '@/types/defaultProps'

export interface PropToForm {
  component: string
  value?: string
}

export type PropsToForms = {
  [P in keyof TextComponentProps]?: PropToForm
}

export const mapPropsToForms: PropsToForms = {
  text: {
    component: 'a-input',
  },
}
