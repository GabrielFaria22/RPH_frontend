import { ResourceCreatePage } from '../../shared/pages/ResourceCreatePage'

const kind = 'worlds'

// Renders the create page for world resources.
export function WorldCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
