import { ResourceEditPage } from '../../shared/pages/ResourceEditPage'

const kind = 'worlds'

// Renders the edit page for world resources.
export function WorldEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
