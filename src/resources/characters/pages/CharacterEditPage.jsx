import { ResourceEditPage } from '../../shared/pages/ResourceEditPage'

const kind = 'characters'

// Renders the edit page for character resources.
export function CharacterEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
