import { PublicResourceIndexPage } from '../../shared/pages/PublicResourceIndexPage'

const kind = 'worlds'

// Renders the public index page for world resources.
export function WorldIndexPage(props) {
  return <PublicResourceIndexPage {...props} kind={kind} title="All Worlds" />
}
