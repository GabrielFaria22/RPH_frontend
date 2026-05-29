import { ResourceCreatePage } from '../../../concerns/resourcePages'

const kind = 'worlds'

export function WorldCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
