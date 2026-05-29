import { ResourceShowPage } from '../../../concerns/resourcePages'

const kind = 'families'

export function FamilyShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
