import type { CommonComponentProps } from '@/types/defaultProps'

export const handleClick = (props: CommonComponentProps) => {
  if (props.actionType === 'url' && props.url) {
    window.location.href = props.url
  }
}
