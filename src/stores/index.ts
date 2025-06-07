import type { EditorProps } from './editor'
import type { GlobalStatus } from './global'
import type { TemplatesProps } from './templates'
import type { UserProps } from './user'

export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
  global: GlobalStatus
}
