import { PublicIndexPage } from '../../../concerns/resourcePages'

const kind = 'universes'

export function UniverseIndexPage(props) {
  return <PublicIndexPage {...props} kind={kind} title="All Universes" />
}
