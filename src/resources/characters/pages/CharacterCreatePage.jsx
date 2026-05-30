import { ResourceCreatePage } from '../../shared/pages/ResourceCreatePage'

const kind = 'characters'

// Renders the create page for character resources.
export function CharacterCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
