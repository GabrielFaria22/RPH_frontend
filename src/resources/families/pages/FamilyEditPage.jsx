import { ResourceEditPage } from '../../shared/pages/ResourceEditPage'

const kind = 'families'

// Renders the edit page for family resources.
export function FamilyEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
