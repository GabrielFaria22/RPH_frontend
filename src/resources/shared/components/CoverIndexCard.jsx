
import {
  initialsFor,
  resourceImage,
  resourcePortrait,
  summarize,
} from '../../../concerns/resourceHelpers'

// Renders one visual resource card in public index grids, using portraits for characters.
export function CoverIndexCard({ item, kind, onNavigate }) {
  const cover = kind === 'characters' ? resourcePortrait(item) : resourceImage(item)
  const description =
    kind === 'characters'
      ? item.description || item.story || item.occupation
      : item.description
  const fallback =
    kind === 'characters'
      ? 'A character page waiting for story details.'
      : 'A wiki page waiting for a description.'

  const href = `/${kind}/${item.id}`

  return (
    <a
      className={`cover-index-card ${kind}`}
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(href)
      }}
    >
      {cover ? (
        <img src={cover} alt="" />
      ) : (
        <div className="cover-fallback" aria-hidden="true">
          {initialsFor(item.name || 'RH')}
        </div>
      )}
      <div className="cover-shade" aria-hidden="true" />
      <div className="cover-card-content">
        {kind === 'characters' ? null : (
          <span>{item.public ? 'Public' : 'Mine'}</span>
        )}
        <h2>{item.name}</h2>
        {kind === 'characters' ? null : <p>{summarize(description, fallback)}</p>}
      </div>
    </a>
  )
}
