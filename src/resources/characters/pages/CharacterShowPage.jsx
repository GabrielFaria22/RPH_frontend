import { ResourceShowPage } from '../../shared/pages/ResourceShowPage'

const kind = 'characters'

// Renders the show page for character resources.
export function CharacterShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
