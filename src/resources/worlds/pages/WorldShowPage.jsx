import { ResourceShowPage } from '../../../concerns/resourcePages'

const kind = 'worlds'

export function WorldShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
