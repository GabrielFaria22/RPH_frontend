import { ResourceEditPage } from '../../../concerns/resourcePages'

const kind = 'families'

export function FamilyEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
