import { ResourceCreatePage } from '../../../concerns/resourcePages'

const kind = 'characters'

export function CharacterCreatePage(props) {
  return <ResourceCreatePage {...props} kind={kind} />
}
