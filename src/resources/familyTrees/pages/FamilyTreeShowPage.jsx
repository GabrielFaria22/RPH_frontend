import { FamilyTreePage } from './FamilyTreePage'

// Renders FamilyTreePage in read-only mode.
export function FamilyTreeShowPage(props) {
  return <FamilyTreePage {...props} mode="show" />
}
