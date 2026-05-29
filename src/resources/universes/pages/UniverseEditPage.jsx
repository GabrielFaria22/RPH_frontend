import { ResourceEditPage } from '../../../concerns/resourcePages'

const kind = 'universes'

export function UniverseEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
