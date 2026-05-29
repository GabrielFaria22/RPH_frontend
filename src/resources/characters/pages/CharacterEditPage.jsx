import { ResourceEditPage } from '../../../concerns/resourcePages'

const kind = 'characters'

export function CharacterEditPage(props) {
  return <ResourceEditPage {...props} kind={kind} />
}
