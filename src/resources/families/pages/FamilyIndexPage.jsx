import { PublicIndexPage } from '../../../concerns/resourcePages'

const kind = 'families'

export function FamilyIndexPage(props) {
  return <PublicIndexPage {...props} kind={kind} title="All Families" />
}
