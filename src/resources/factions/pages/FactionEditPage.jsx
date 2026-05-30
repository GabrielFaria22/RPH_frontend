import { ResourceEditPage } from '../../shared/pages/ResourceEditPage'

const kind = 'factions'

// Renders the edit page for faction resources.
export function FactionEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
