import { PublicIndexPage } from '../../../concerns/resourcePages'

const kind = 'factions'

export function FactionIndexPage(props) {
  return <PublicIndexPage {...props} kind={kind} title="All Factions" />
}
