import { ResourceCreatePage } from '../../shared/pages/ResourceCreatePage'

const kind = 'factions'

// Renders the create page for faction resources.
export function FactionCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
