import { ResourceShowPage } from '../../shared/pages/ResourceShowPage'

const kind = 'families'

// Renders the show page for family resources.
export function FamilyShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
