
import { useState } from 'react'
import { AppHeader } from '../../../pages/app/AppHeader'
import { postFormData } from '../../../concerns/api'
import { RESOURCE_CONFIG } from '../../../concerns/resourceConfig'
import { useArchiveData } from '../../../concerns/resourceHooks'
import { ImageCropInput } from '../components/ImageCropInput'

// Matches the relationship enum values expected by the backend for new linked characters.
const CHARACTER_RELATION_TYPES = [
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Grandparent', value: 'grandparent' },
  { label: 'Grandchild', value: 'grandchild' },
  { label: 'Ancestor', value: 'ancestor' },
  { label: 'Descendant', value: 'descendant' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Partner', value: 'partner' },
  { label: 'Lover', value: 'lover' },
  { label: 'Fiancé', value: 'fiance' },
  { label: 'Ex-partner', value: 'ex_partner' },
  { label: 'Friend', value: 'friend' },
  { label: 'Best friend', value: 'best_friend' },
  { label: 'Acquaintance', value: 'acquaintance' },
  { label: 'Ally', value: 'ally' },
  { label: 'Enemy', value: 'enemy' },
  { label: 'Rival', value: 'rival' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Student', value: 'student' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Ward', value: 'ward' },
  { label: 'Adoptive parent', value: 'adoptive_parent' },
  { label: 'Adoptive child', value: 'adoptive_child' },
  { label: 'Step-parent', value: 'step_parent' },
  { label: 'Step-child', value: 'step_child' },
  { label: 'Uncle/Aunt', value: 'uncle_aunt' },
  { label: 'Nephew/Niece', value: 'nephew_niece' },
  { label: 'Cousin', value: 'cousin' },
  { label: 'Coworker', value: 'coworker' },
  { label: 'Leader', value: 'leader' },
  { label: 'Follower', value: 'follower' },
  { label: 'Master', value: 'master' },
  { label: 'Servant', value: 'servant' },
  { label: 'Creator', value: 'creator' },
  { label: 'Creation', value: 'creation' },
  { label: 'Alternate version', value: 'alternate_version' },
  { label: 'Other', value: 'other' },
]

// Renders the shared create form used by resource-specific create pages.
export function ResourceCreatePage({
  kind,
  onBack,
  onCreated,
  onLogout,
  onNavigate,
  user,
}) {
  const config = RESOURCE_CONFIG[kind]
  const { archive, error: archiveError, status: archiveStatus } = useArchiveData()
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [age, setAge] = useState('')
  const [appearance, setAppearance] = useState('')
  const [occupation, setOccupation] = useState('')
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [familyIds, setFamilyIds] = useState([])
  const [factionId, setFactionId] = useState('')
  const [leaderCharacterId, setLeaderCharacterId] = useState('')
  const [linkedCharacterId] = useState(
    new URLSearchParams(window.location.search).get('related_character_id') || '',
  )
  const [linkedRelationType, setLinkedRelationType] = useState(
    new URLSearchParams(window.location.search).get('relation_type') || 'sibling',
  )
  const [universeId, setUniverseId] = useState(
    new URLSearchParams(window.location.search).get('universe_id') || '',
  )
  const [worldId, setWorldId] = useState('')
  const [portraitFile, setPortraitFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  // Worlds and characters always need a universe; families/factions opt in through config.
  const needsUniverse = config.needsUniverse || kind === 'worlds' || kind === 'characters'
  // Keeps the submit button disabled until all required fields for the current resource exist.
  const canSubmit =
    name.trim() &&
    status !== 'loading' &&
    (!needsUniverse || universeId) &&
    (!config.needsLeaderCharacter || leaderCharacterId) &&
    (!config.requiresFamilies || familyIds.length > 0)

  // Creates the resource by translating the current form state into API form data.
  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append(`${config.formKey}[name]`, name.trim())
      formData.append(`${config.formKey}[description]`, description)
      formData.append(`${config.formKey}[public]`, isPublic ? 'true' : 'false')
      if (kind === 'characters') {
        formData.append('character[story]', story)
        if (fullName.trim()) formData.append('character[full_name]', fullName.trim())
        if (nickname.trim()) formData.append('character[nickname]', nickname.trim())
        if (age.trim()) formData.append('character[age]', age.trim())
        if (appearance.trim()) formData.append('character[appearance]', appearance.trim())
        if (occupation.trim()) {
          formData.append('character[occupation]', occupation.trim())
        }
        if (linkedCharacterId) {
          formData.append(
            'character[character_relationships_attributes][0][related_character_id]',
            linkedCharacterId,
          )
          formData.append(
            'character[character_relationships_attributes][0][relation_type]',
            linkedRelationType,
          )
        }
      }
      if (config.needsLeaderCharacter) {
        formData.append(`${config.formKey}[leader_character_id]`, leaderCharacterId)
      }
      if (config.hasOptionalFaction) {
        formData.append(`${config.formKey}[faction_id]`, factionId)
      }
      if (config.hasFamilies) {
        familyIds.forEach((familyId) => {
          formData.append(`${config.formKey}[family_ids][]`, familyId)
        })
      }
      if (universeId) formData.append(`${config.formKey}[universe_id]`, universeId)
      if (worldId) formData.append(`${config.formKey}[world_id]`, worldId)
      if (portraitFile) {
        formData.append(`${config.formKey}[portrait_image]`, portraitFile)
      }
      if (coverFile) formData.append(`${config.formKey}[cover_image]`, coverFile)
      galleryFiles.forEach((file) => {
        formData.append(`${config.formKey}[misc_images][]`, file)
      })

      const createdResource = await postFormData(`/api/v1/${kind}`, formData)
      setStatus('success')
      setMessage(`${config.label} created.`)
      onCreated(createdResource)
    } catch (createError) {
      setStatus('error')
      setMessage(createError.message)
    }
  }

  return (
    <main className="app-shell">
      <AppHeader
        activeResource={kind}
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <section className="edit-page">
        <button className="back-button" type="button" onClick={onBack}>
          Back to {kind}
        </button>
        <p className="eyebrow">Create {config.loadingLabel}</p>
        <h1>New {config.label}</h1>

        <form className="wiki-editor-card create-resource-form" onSubmit={handleSubmit}>
          <label htmlFor="new-resource-name">Name</label>
          <input
            id="new-resource-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {needsUniverse ? (
            <>
              <label htmlFor="new-resource-universe">Universe</label>
              <select
                id="new-resource-universe"
                required
                value={universeId}
                onChange={(event) => {
                  setUniverseId(event.target.value)
                  setFactionId('')
                  setFamilyIds([])
                  setLeaderCharacterId('')
                  setWorldId('')
                }}
              >
                <option value="">Choose a universe</option>
                {archive.universes.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.name}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          {config.needsLeaderCharacter ? (
            <>
              <label htmlFor="new-resource-leader-character">Leader character</label>
              <select
                id="new-resource-leader-character"
                required
                value={leaderCharacterId}
                onChange={(event) => setLeaderCharacterId(event.target.value)}
              >
                <option value="">Choose a leader</option>
                {archive.characters
                  .filter(
                    (character) =>
                      !universeId || String(character.universe_id) === universeId,
                  )
                  .map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
              </select>
            </>
          ) : null}

          {config.hasOptionalFaction ? (
            <>
              <label htmlFor="new-resource-faction">Faction</label>
              <select
                id="new-resource-faction"
                value={factionId}
                onChange={(event) => setFactionId(event.target.value)}
              >
                <option value="">No faction yet</option>
                {archive.factions
                  .filter((faction) => !universeId || String(faction.universe_id) === universeId)
                  .map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
              </select>
            </>
          ) : null}

          {config.hasFamilies ? (
            <>
              <label htmlFor="new-resource-families">Families</label>
              <select
                id="new-resource-families"
                multiple
                required={Boolean(config.requiresFamilies)}
                value={familyIds}
                onChange={(event) =>
                  setFamilyIds(
                    Array.from(event.target.selectedOptions, (option) => option.value),
                  )
                }
              >
                {archive.families
                  .filter((family) => !universeId || String(family.universe_id) === universeId)
                  .map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
              </select>
              <p className="editor-help">
                {config.requiresFamilies ? 'Select at least one family. ' : ''}
                Use Ctrl or Shift to select more than one.
              </p>
            </>
          ) : null}

          {kind === 'characters' ? (
            <>
              <label htmlFor="new-resource-world">World</label>
              <select
                id="new-resource-world"
                value={worldId}
                onChange={(event) => setWorldId(event.target.value)}
              >
                <option value="">No world yet</option>
                {archive.worlds
                  .filter((world) => !universeId || String(world.universe_id) === universeId)
                  .map((world) => (
                    <option key={world.id} value={world.id}>
                      {world.name}
                    </option>
                  ))}
              </select>

              <div className="resource-field-grid">
                <div>
                  <label htmlFor="new-resource-full-name">Full name</label>
                  <input
                    id="new-resource-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="new-resource-nickname">Nickname</label>
                  <input
                    id="new-resource-nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="new-resource-age">Age</label>
                  <input
                    id="new-resource-age"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="new-resource-occupation">Occupation</label>
                  <input
                    id="new-resource-occupation"
                    value={occupation}
                    onChange={(event) => setOccupation(event.target.value)}
                  />
                </div>
              </div>

              <label htmlFor="new-resource-appearance">Appearance</label>
              <textarea
                id="new-resource-appearance"
                value={appearance}
                onChange={(event) => setAppearance(event.target.value)}
                placeholder="Describe visual details, style, or presence."
              />

              {linkedCharacterId ? (
                <fieldset className="character-relations-fieldset">
                  <legend>Starting relation</legend>
                  <label htmlFor="new-resource-linked-relation">
                    Relation to{' '}
                    {displayCharacterName(archive.characters, linkedCharacterId)}
                  </label>
                  <select
                    id="new-resource-linked-relation"
                    value={linkedRelationType}
                    onChange={(event) => setLinkedRelationType(event.target.value)}
                  >
                    {CHARACTER_RELATION_TYPES.map((relation) => (
                      <option key={relation.value} value={relation.value}>
                        {relation.label}
                      </option>
                    ))}
                  </select>
                </fieldset>
              ) : null}
            </>
          ) : null}

          {archiveStatus === 'error' ? (
            <p className="form-message error">{archiveError}</p>
          ) : null}

          <label className="checkbox-row" htmlFor="new-resource-public">
            <input
              id="new-resource-public"
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            Public {config.loadingLabel}
          </label>

          <label htmlFor="new-resource-description">Short article text</label>
          <textarea
            id="new-resource-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={`Write a first description for this ${config.loadingLabel}. You can edit it as a full article after creating it.`}
          />

          {kind === 'characters' ? (
            <>
              <label htmlFor="new-resource-story">Backstory</label>
              <textarea
                id="new-resource-story"
                value={story}
                onChange={(event) => setStory(event.target.value)}
                placeholder="Write backstory, arcs, or narrative notes."
              />
            </>
          ) : null}

          {config.hasImages ? (
            <fieldset className="image-upload-fieldset">
              <legend>{config.imageLegend}</legend>
              <ImageCropInput
                id="new-resource-portrait"
                label="Portrait image"
                mode="portrait"
                onCroppedFile={setPortraitFile}
              />
              <ImageCropInput
                id="new-resource-cover"
                label="Cover image"
                mode="cover"
                onCroppedFile={setCoverFile}
              />
              <label htmlFor="new-resource-gallery">Gallery images</label>
              <input
                id="new-resource-gallery"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                type="file"
                onChange={(event) =>
                  setGalleryFiles(Array.from(event.target.files || []))
                }
              />
              <p>
                Gallery images are uploaded as selected and can use any proportion.
              </p>
            </fieldset>
          ) : null}

          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Creating...' : `Create ${config.loadingLabel}`}
          </button>
          {message ? (
            <p className={`form-message ${status}`}>{message}</p>
          ) : null}
        </form>
      </section>
    </main>
  )
}

// Finds the existing linked character name for the "create related character" flow.
function displayCharacterName(characters, characterId) {
  return (
    characters.find((character) => String(character.id) === String(characterId))?.name ||
    `Character #${characterId}`
  )
}
