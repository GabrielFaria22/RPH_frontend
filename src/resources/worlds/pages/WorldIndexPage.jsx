import { PublicIndexPage } from '../../../concerns/resourcePages'

const kind = 'worlds'

export function WorldIndexPage(props) {
  return <PublicIndexPage {...props} kind={kind} title="All Worlds" />
}
