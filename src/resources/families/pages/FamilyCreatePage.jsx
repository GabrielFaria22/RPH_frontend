import { ResourceCreatePage } from '../../../concerns/resourcePages'

const kind = 'families'

export function FamilyCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
