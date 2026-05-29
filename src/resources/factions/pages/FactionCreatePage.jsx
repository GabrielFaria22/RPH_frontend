import { ResourceCreatePage } from '../../../concerns/resourcePages'

const kind = 'factions'

export function FactionCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
