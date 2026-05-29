import { ResourceShowPage } from '../../../concerns/resourcePages'

const kind = 'characters'

export function CharacterShowPage(props) {
  return <ResourceShowPage {...props} kind={kind} />
}
