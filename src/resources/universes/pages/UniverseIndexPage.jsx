import { PublicResourceIndexPage } from '../../shared/pages/PublicResourceIndexPage'

const kind = 'universes'

// Renders the public index page for universe resources.
export function UniverseIndexPage(props) {
  return <PublicResourceIndexPage {...props} kind={kind} title="All Universes" />
}
