import { ResourceCreatePage } from '../../../concerns/resourcePages'

const kind = 'universes'

export function UniverseCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
