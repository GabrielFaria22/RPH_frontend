import { ResourceCreatePage } from '../../shared/pages/ResourceCreatePage'

const kind = 'families'

// Renders the create page for family resources.
export function FamilyCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
