import { PublicResourceIndexPage } from '../../shared/pages/PublicResourceIndexPage'

const kind = 'factions'

// Renders the public index page for faction resources.
export function FactionIndexPage(props) {
  return <PublicResourceIndexPage {...props} kind={kind} title="All Factions" />
}
