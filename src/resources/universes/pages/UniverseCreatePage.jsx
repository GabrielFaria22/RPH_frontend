import { ResourceCreatePage } from '../../shared/pages/ResourceCreatePage'

const kind = 'universes'

// Renders the create page for universe resources.
export function UniverseCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
