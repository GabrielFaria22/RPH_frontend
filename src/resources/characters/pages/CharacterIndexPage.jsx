import { PublicIndexPage } from '../../../concerns/resourcePages'

const kind = 'characters'

export function CharacterIndexPage(props) {
  return <PublicIndexPage {...props} kind={kind} title="All Characters" />
}
