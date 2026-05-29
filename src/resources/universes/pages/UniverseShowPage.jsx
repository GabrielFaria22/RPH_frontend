import { ResourceShowPage } from '../../../concerns/resourcePages'

const kind = 'universes'

export function UniverseShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
