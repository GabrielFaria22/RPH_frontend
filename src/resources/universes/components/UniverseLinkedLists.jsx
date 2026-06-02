import { useMemo, useState } from 'react'
import { usePublicResources } from '../../../concerns/resourceHooks'
import {
  initialsFor,
  resourceImage,
  resourcePortrait,
} from '../../../concerns/resourceHelpers'

// Renders tabbed universe content, including the default description and linked resources.
export function UniverseLinkedLists({ descriptionContent, onNavigate, universe }) {
  const [activeTab, setActiveTab] = useState('description')
  const [worldSearch, setWorldSearch] = useState('')
  const [familySearch, setFamilySearch] = useState('')
  const [factionSearch, setFactionSearch] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const { items: worlds, status: worldsStatus } = usePublicResources('worlds')
  const { items: families, status: familiesStatus } = usePublicResources('families')
  const { items: factions, status: factionsStatus } = usePublicResources('factions')
  const { items: characters, status: charactersStatus } =
    usePublicResources('characters')
  // Each list is filtered from public/owned resources down to this universe.
  const universeWorlds = useMemo(
    () => worlds.filter((world) => belongsToUniverse(world, universe.id)),
    [universe.id, worlds],
  )
  const universeFamilies = useMemo(
    () => families.filter((family) => belongsToUniverse(family, universe.id)),
    [families, universe.id],
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
  const visibleFamilies = useMemo(
    () => filterByName(universeFamilies, familySearch),
    [familySearch, universeFamilies],
  )
  const visibleFactions = useMemo(
    () => filterByName(universeFactions, factionSearch),
    [factionSearch, universeFactions],
  )
  const visibleCharacters = useMemo(
    () => filterByName(universeCharacters, characterSearch),
    [characterSearch, universeCharacters],
  )
  const firstWorldImage = resourceImage(universeWorlds[0] || {})
  const firstFamilyImage = resourceImage(universeFamilies[0] || {})
  const firstFactionImage = resourceImage(universeFactions[0] || {})

  return (
    <section className="universe-linked-archive" aria-label="Universe resources">
      <div className="universe-link-triggers" role="tablist" aria-label="Universe sections">
        <button
          aria-selected={activeTab === 'description'}
          className={activeTab === 'description' ? 'active' : ''}
          role="tab"
          type="button"
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          aria-selected={activeTab === 'worlds'}
          className={activeTab === 'worlds' ? 'active' : ''}
          role="tab"
          style={
            firstWorldImage ? { backgroundImage: `url(${firstWorldImage})` } : undefined
          }
          type="button"
          onClick={() => setActiveTab('worlds')}
        >
          <span>{universeWorlds.length}</span>
          Worlds
        </button>
        <button
          aria-selected={activeTab === 'factions'}
          className={activeTab === 'factions' ? 'active' : ''}
          role="tab"
          style={
            firstFactionImage
              ? { backgroundImage: `url(${firstFactionImage})` }
              : undefined
          }
          type="button"
          onClick={() => setActiveTab('factions')}
        >
          <span>{universeFactions.length}</span>
          Factions
        </button>
        <button
          aria-selected={activeTab === 'families'}
          className={activeTab === 'families' ? 'active' : ''}
          role="tab"
          style={
            firstFamilyImage
              ? { backgroundImage: `url(${firstFamilyImage})` }
              : undefined
          }
          type="button"
          onClick={() => setActiveTab('families')}
        >
          <span>{universeFamilies.length}</span>
          Families
        </button>
        <button
          aria-selected={activeTab === 'characters'}
          className={activeTab === 'characters' ? 'active' : ''}
          role="tab"
          type="button"
          onClick={() => setActiveTab('characters')}
        >
          <span>{universeCharacters.length}</span>
          Characters
        </button>
      </div>

      {activeTab === 'description' ? (
        <div className="universe-tab-panel" role="tabpanel">
          {descriptionContent}
        </div>
      ) : null}

      {activeTab === 'worlds' ? (
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

      {activeTab === 'factions' ? (
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

      {activeTab === 'families' ? (
        <LinkedPanel
          createLabel="Create family"
          createPath={createPath('families', universe.id)}
          emptyText={
            familiesStatus === 'loading'
              ? 'Loading families...'
              : 'No families found.'
          }
          hasItems={visibleFamilies.length > 0}
          searchId="universe-family-search"
          searchLabel="Search families"
          searchValue={familySearch}
          title="Families"
          onCreate={onNavigate}
          onSearch={setFamilySearch}
        >
          <div className="linked-family-list">
            {visibleFamilies.map((family) => (
              <button
                className="linked-family-row"
                key={family.id}
                style={
                  resourceImage(family)
                    ? { backgroundImage: `url(${resourceImage(family)})` }
                    : undefined
                }
                type="button"
                onClick={() => onNavigate(`/families/${family.id}`)}
              >
                <span>{family.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}

      {activeTab === 'characters' ? (
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
