import { useMemo, useState } from 'react'
import { usePublicResources } from '../../../concerns/resourceHooks'
import {
  initialsFor,
  resourceImage,
  resourcePortrait,
} from '../../../concerns/resourceHelpers'

// Renders expandable, searchable lists for resources that belong to a universe.
export function UniverseLinkedLists({ onNavigate, universe }) {
  const [activePanel, setActivePanel] = useState('')
  const [worldSearch, setWorldSearch] = useState('')
  const [factionSearch, setFactionSearch] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const { items: worlds, status: worldsStatus } = usePublicResources('worlds')
  const { items: factions, status: factionsStatus } = usePublicResources('factions')
  const { items: characters, status: charactersStatus } =
    usePublicResources('characters')
  // Each list is filtered from public/owned resources down to this universe.
  const universeWorlds = useMemo(
    () => worlds.filter((world) => belongsToUniverse(world, universe.id)),
    [universe.id, worlds],
  )
  const universeFactions = useMemo(
    () => factions.filter((faction) => belongsToUniverse(faction, universe.id)),
    [factions, universe.id],
  )
  const universeCharacters = useMemo(
    () =>
      characters.filter((character) => belongsToUniverse(character, universe.id)),
    [characters, universe.id],
  )
  // Each visible* list applies the search text for the corresponding open drawer.
  const visibleWorlds = useMemo(
    () => filterByName(universeWorlds, worldSearch),
    [universeWorlds, worldSearch],
  )
  const visibleFactions = useMemo(
    () => filterByName(universeFactions, factionSearch),
    [factionSearch, universeFactions],
  )
  const visibleCharacters = useMemo(
    () => filterByName(universeCharacters, characterSearch),
    [characterSearch, universeCharacters],
  )

  // Opens the requested linked-resource drawer, or closes it if already open.
  const togglePanel = (panel) => {
    setActivePanel((current) => (current === panel ? '' : panel))
  }

  return (
    <section className="universe-linked-archive" aria-label="Universe resources">
      <div className="universe-link-triggers">
        <button
          className={activePanel === 'worlds' ? 'active' : ''}
          type="button"
          onClick={() => togglePanel('worlds')}
        >
          <span>{universeWorlds.length}</span>
          Worlds
        </button>
        <button
          className={activePanel === 'factions' ? 'active' : ''}
          type="button"
          onClick={() => togglePanel('factions')}
        >
          <span>{universeFactions.length}</span>
          Factions
        </button>
        <button
          className={activePanel === 'characters' ? 'active' : ''}
          type="button"
          onClick={() => togglePanel('characters')}
        >
          <span>{universeCharacters.length}</span>
          Characters
        </button>
      </div>

      {activePanel === 'worlds' ? (
        <LinkedPanel
          createLabel="Create world"
          createPath={createPath('worlds', universe.id)}
          emptyText={
            worldsStatus === 'loading' ? 'Loading worlds...' : 'No worlds found.'
          }
          hasItems={visibleWorlds.length > 0}
          searchId="universe-world-search"
          searchLabel="Search worlds"
          searchValue={worldSearch}
          title="Worlds"
          onCreate={onNavigate}
          onSearch={setWorldSearch}
        >
          <div className="linked-world-list">
            {visibleWorlds.map((world) => (
              <button
                className="linked-world-row"
                key={world.id}
                style={
                  resourceImage(world)
                    ? { backgroundImage: `url(${resourceImage(world)})` }
                    : undefined
                }
                type="button"
                onClick={() => onNavigate(`/worlds/${world.id}`)}
              >
                <span>{world.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}

      {activePanel === 'factions' ? (
        <LinkedPanel
          createLabel="Create faction"
          createPath={createPath('factions', universe.id)}
          emptyText={
            factionsStatus === 'loading'
              ? 'Loading factions...'
              : 'No factions found.'
          }
          hasItems={visibleFactions.length > 0}
          searchId="universe-faction-search"
          searchLabel="Search factions"
          searchValue={factionSearch}
          title="Factions"
          onCreate={onNavigate}
          onSearch={setFactionSearch}
        >
          <div className="linked-faction-list">
            {visibleFactions.map((faction) => (
              <button
                className="linked-faction-row"
                key={faction.id}
                style={
                  resourceImage(faction)
                    ? { backgroundImage: `url(${resourceImage(faction)})` }
                    : undefined
                }
                type="button"
                onClick={() => onNavigate(`/factions/${faction.id}`)}
              >
                <span>{faction.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}

      {activePanel === 'characters' ? (
        <LinkedPanel
          createLabel="Create character"
          createPath={createPath('characters', universe.id)}
          emptyText={
            charactersStatus === 'loading'
              ? 'Loading characters...'
              : 'No characters found.'
          }
          hasItems={visibleCharacters.length > 0}
          searchId="universe-character-search"
          searchLabel="Search characters"
          searchValue={characterSearch}
          title="Characters"
          onCreate={onNavigate}
          onSearch={setCharacterSearch}
        >
          <div className="linked-character-list">
            {visibleCharacters.map((character) => (
              <button
                className="linked-character-row"
                key={character.id}
                type="button"
                onClick={() => onNavigate(`/characters/${character.id}`)}
              >
                {resourcePortrait(character) ? (
                  <img src={resourcePortrait(character)} alt="" />
                ) : (
                  <span className="linked-character-fallback" aria-hidden="true">
                    {initialsFor(character.name || 'RH')}
                  </span>
                )}
                <span>{character.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}
    </section>
  )
}

// Renders a named drawer panel with its search field and empty state.
function LinkedPanel({
  children,
  createLabel,
  createPath,
  emptyText,
  hasItems,
  onCreate,
  onSearch,
  searchId,
  searchLabel,
  searchValue,
  title,
}) {
  return (
    <div className="universe-linked-panel">
      <div className="linked-panel-header">
        <h2>{title}</h2>
        <div className="linked-panel-actions">
          <label htmlFor={searchId}>
            <span>{searchLabel}</span>
            <input
              id={searchId}
              type="search"
              value={searchValue}
              onChange={(event) => onSearch(event.target.value)}
            />
          </label>
          <a
            className="linked-panel-create"
            href={createPath}
            onClick={(event) => {
              event.preventDefault()
              onCreate(createPath)
            }}
          >
            {createLabel}
          </a>
        </div>
      </div>
      {hasItems ? children : <p className="empty-state">{emptyText}</p>}
    </div>
  )
}

function createPath(kind, universeId) {
  return `/${kind}/new?universe_id=${encodeURIComponent(universeId)}`
}

// Checks whether a visible resource is connected to the current universe.
function belongsToUniverse(resource, universeId) {
  return (
    String(resource.universe_id) === String(universeId) ||
    String(resource.universe?.id) === String(universeId)
  )
}

// Filters linked resources by name using a case-insensitive search string.
function filterByName(items, search) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return items

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch),
  )
}
