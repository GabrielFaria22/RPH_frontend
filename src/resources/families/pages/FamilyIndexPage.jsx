import { PublicResourceIndexPage } from '../../shared/pages/PublicResourceIndexPage'

const kind = 'families'

// Renders the public index page for family resources.
export function FamilyIndexPage(props) {
  return <PublicResourceIndexPage {...props} kind={kind} title="All Families" />
}
