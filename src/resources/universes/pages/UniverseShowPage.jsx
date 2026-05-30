import { ResourceShowPage } from '../../shared/pages/ResourceShowPage'
import { UniverseLinkedLists } from '../components/UniverseLinkedLists'

const kind = 'universes'

// Renders the show page for universe resources and injects universe-only lists.
export function UniverseShowPage(props) {
  return (
    <ResourceShowPage
      {...props}
      kind={kind}
      renderAfterTitle={(universe) => (
        <UniverseLinkedLists
          universe={universe}
          onNavigate={props.onNavigate}
        />
      )}
    />
  )
}
