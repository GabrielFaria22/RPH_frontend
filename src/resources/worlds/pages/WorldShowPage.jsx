import { ResourceShowPage } from '../../shared/pages/ResourceShowPage'

const kind = 'worlds'

// Renders the show page for world resources.
export function WorldShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
