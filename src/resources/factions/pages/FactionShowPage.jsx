import { ResourceShowPage } from '../../shared/pages/ResourceShowPage'

const kind = 'factions'

// Renders the show page for faction resources.
export function FactionShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
