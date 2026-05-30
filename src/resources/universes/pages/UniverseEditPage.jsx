import { ResourceEditPage } from '../../shared/pages/ResourceEditPage'

const kind = 'universes'

// Renders the edit page for universe resources.
export function UniverseEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
