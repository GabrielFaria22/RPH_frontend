import { ResourceEditPage } from '../../../concerns/resourcePages'

const kind = 'worlds'

export function WorldEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
