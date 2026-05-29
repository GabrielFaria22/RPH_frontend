import { ResourceEditPage } from '../../../concerns/resourcePages'

const kind = 'factions'

export function FactionEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
