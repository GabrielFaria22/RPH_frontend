import { PublicResourceIndexPage } from '../../shared/pages/PublicResourceIndexPage'

const kind = 'characters'

// Renders the public index page for character resources.
export function CharacterIndexPage(props) {
  return <PublicResourceIndexPage {...props} kind={kind} title="All Characters" />
}
