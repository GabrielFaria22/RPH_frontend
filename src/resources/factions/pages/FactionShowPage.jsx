import { ResourceShowPage } from '../../../concerns/resourcePages'

const kind = 'factions'

export function FactionShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
