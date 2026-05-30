
import { useMemo, useState } from 'react'
import { patchFormData } from '../../../concerns/api'
import { useArchiveData } from '../../../concerns/resourceHooks'
import {
  attachmentUrl,
  parseArticleSections,
  sanitizeArticleHtml,
  sectionsToHtml,
} from '../../../concerns/resourceHelpers'
import { ImageCropInput } from './ImageCropInput'

// Renders the shared edit form and maps resource-specific fields from config.
export function ResourceEditorForm({ config, id, kind, onSaved, resource, setResource }) {
  const { archive, error: archiveError, status: archiveStatus } = useArchiveData()
  const initialFriendlyArticle = useMemo(
    () => parseArticleSections(resource.description || resource.story || ''),
    [resource.description, resource.story],
  )
  const [name, setName] = useState(resource.name || '')
  const [fullName, setFullName] = useState(resource.full_name || '')
  const [nickname, setNickname] = useState(resource.nickname || '')
  const [age, setAge] = useState(resource.age || '')
  const [appearance, setAppearance] = useState(resource.appearance || '')
  const [occupation, setOccupation] = useState(resource.occupation || '')
  const [description, setDescription] = useState(
    resource.description || resource.story || '',
  )
  const [familyIds, setFamilyIds] = useState((resource.family_ids || []).map(String))
  const [factionId, setFactionId] = useState(
    resource.faction_id ? String(resource.faction_id) : '',
  )
  const [leaderCharacterId, setLeaderCharacterId] = useState(
    resource.leader_character_id ? String(resource.leader_character_id) : '',
  )
  const [story, setStory] = useState(resource.story || '')
  const [universeId, setUniverseId] = useState(
    resource.universe_id ? String(resource.universe_id) : '',
  )
  const [worldId, setWorldId] = useState(
    resource.world_id ? String(resource.world_id) : '',
  )
  const [friendlyArticle, setFriendlyArticle] = useState(initialFriendlyArticle)
  const [editorTab, setEditorTab] = useState('friendly')
  const [isPublic, setIsPublic] = useState(Boolean(resource.public))
  const [portraitFile, setPortraitFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [saveStatus, setSaveStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const friendlyDescription = useMemo(
    () => sectionsToHtml(friendlyArticle),
    [friendlyArticle],
  )
  const effectiveDescription =
    editorTab === 'friendly' ? friendlyDescription : description
  const canSave =
    saveStatus !== 'loading' &&
    name.trim() &&
    (kind === 'universes' || universeId) &&
    (!config.needsLeaderCharacter || leaderCharacterId) &&
    (!config.requiresFamilies || familyIds.length > 0)
  const preview = useMemo(
    () => sanitizeArticleHtml(effectiveDescription),
    [effectiveDescription],
  )
  const attachedImages = [
    resource.portrait_image
      ? { label: 'Portrait image', attachment: resource.portrait_image }
      : null,
    resource.cover_image
      ? { label: 'Cover image', attachment: resource.cover_image }
      : null,
    ...(resource.misc_images || []).map((attachment, index) => ({
      label: `Gallery image ${index + 1}`,
      attachment,
    })),
  ].filter(Boolean)
  const availableUniverses =
    universeId && !archive.universes.some((universe) => String(universe.id) === universeId)
      ? [
          {
            id: universeId,
            name: resource.universe?.name || `Universe #${universeId}`,
          },
          ...archive.universes,
        ]
      : archive.universes
  const availableWorlds =
    worldId && !archive.worlds.some((world) => String(world.id) === worldId)
      ? [
          {
            id: worldId,
            name: resource.world?.name || `World #${worldId}`,
            universe_id: universeId,
          },
          ...archive.worlds,
        ]
      : archive.worlds
  const availableFactions =
    factionId && !archive.factions.some((faction) => String(faction.id) === factionId)
      ? [
          {
            id: factionId,
            name: resource.faction?.name || `Faction #${factionId}`,
            universe_id: universeId,
          },
          ...archive.factions,
        ]
      : archive.factions
  const availableCharacters =
    leaderCharacterId &&
    !archive.characters.some((character) => String(character.id) === leaderCharacterId)
      ? [
          {
            id: leaderCharacterId,
            name: `Character #${leaderCharacterId}`,
            universe_id: universeId,
          },
          ...archive.characters,
        ]
      : archive.characters
  const availableFamilies =
    familyIds.some(
      (familyId) => !archive.families.some((family) => String(family.id) === familyId),
    )
      ? [
          ...familyIds
            .filter(
              (familyId) =>
                !archive.families.some((family) => String(family.id) === familyId),
            )
            .map((familyId) => ({
              id: familyId,
              name: `Family #${familyId}`,
              universe_id: universeId,
            })),
          ...archive.families,
        ]
      : archive.families

  // Switches to HTML mode and appends a reusable snippet to the article body.
  const appendHtmlSnippet = (snippet) => {
    setEditorTab('html')
    setDescription((current) =>
      `${(editorTab === 'friendly' ? friendlyDescription : current).trim()}\n\n${snippet}`.trim(),
    )
  }

  // Inserts an uploaded image into the article HTML as an image tag.
  const appendAttachedImage = (attachment) => {
    const src = attachmentUrl(attachment)
    if (!src) return

    appendHtmlSnippet(`<img src="${src}" alt="${attachment.filename || name}">`)
  }

  // Keeps the friendly and HTML editors in sync when the user changes modes.
  const switchEditorTab = (tab) => {
    if (tab === 'html' && editorTab === 'friendly') {
      setDescription(friendlyDescription)
    }

    if (tab === 'friendly' && editorTab === 'html') {
      setFriendlyArticle(parseArticleSections(description))
    }

    setEditorTab(tab)
  }

  // Updates one section in the friendly article editor.
  const updateSection = (index, field, value) => {
    setFriendlyArticle((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }))
  }

  // Adds a new friendly-editor section to the article draft.
  const addSection = () => {
    setFriendlyArticle((current) => ({
      ...current,
      sections: [...current.sections, { body: '', title: 'New section' }],
    }))
  }

  // Removes a friendly-editor section while preserving at least one section.
  const removeSection = (index) => {
    setFriendlyArticle((current) => ({
      ...current,
      sections:
        current.sections.length === 1
          ? [{ body: '', title: 'Overview' }]
          : current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }))
  }

  // Saves the edited resource and uploads any selected media files.
  const handleSave = async (event) => {
    event.preventDefault()
    setSaveStatus('loading')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append(`${config.formKey}[name]`, name.trim())
      formData.append(`${config.formKey}[description]`, effectiveDescription)
      formData.append(`${config.formKey}[public]`, isPublic ? 'true' : 'false')
      if (kind === 'worlds' && universeId) {
        formData.append('world[universe_id]', universeId)
      }
      if (kind === 'characters') {
        formData.append('character[story]', story)
        formData.append('character[universe_id]', universeId)
        formData.append('character[world_id]', worldId)
        formData.append('character[full_name]', fullName.trim())
        formData.append('character[nickname]', nickname.trim())
        formData.append('character[age]', age.trim())
        formData.append('character[appearance]', appearance.trim())
        formData.append('character[occupation]', occupation.trim())
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
      if (portraitFile) {
        formData.append(`${config.formKey}[portrait_image]`, portraitFile)
      }
      if (coverFile) formData.append(`${config.formKey}[cover_image]`, coverFile)
      galleryFiles.forEach((file) => {
        formData.append(`${config.formKey}[misc_images][]`, file)
      })

      const savedResource = await patchFormData(`/api/v1/${kind}/${id}`, formData)
      setResource(savedResource)
      setPortraitFile(null)
      setCoverFile(null)
      setGalleryFiles([])
      setSaveStatus('success')
      setMessage(`${config.label} saved.`)
      onSaved()
    } catch (saveError) {
      setSaveStatus('error')
      setMessage(saveError.message)
    }
  }

  return (
    <div className="edit-layout">
      <form className="wiki-editor-card" onSubmit={handleSave}>
        <label htmlFor="universe-name">Name</label>
        <input
          id="universe-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        {kind === 'worlds' || kind === 'characters' || config.needsUniverse ? (
          <>
            <label htmlFor="resource-universe">Universe</label>
            <select
              id="resource-universe"
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
              {availableUniverses.map((universe) => (
                <option key={universe.id} value={universe.id}>
                  {universe.name}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {config.needsLeaderCharacter ? (
          <>
            <label htmlFor="resource-leader-character">Leader character</label>
            <select
              id="resource-leader-character"
              required
              value={leaderCharacterId}
              onChange={(event) => setLeaderCharacterId(event.target.value)}
            >
              <option value="">Choose a leader</option>
              {availableCharacters
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
            <label htmlFor="resource-faction">Faction</label>
            <select
              id="resource-faction"
              value={factionId}
              onChange={(event) => setFactionId(event.target.value)}
            >
              <option value="">No faction yet</option>
              {availableFactions
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
            <label htmlFor="resource-families">Families</label>
            <select
              id="resource-families"
              multiple
              required={Boolean(config.requiresFamilies)}
              value={familyIds}
              onChange={(event) =>
                setFamilyIds(
                  Array.from(event.target.selectedOptions, (option) => option.value),
                )
              }
            >
              {availableFamilies
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
            <label htmlFor="resource-world">World</label>
            <select
              id="resource-world"
              value={worldId}
              onChange={(event) => setWorldId(event.target.value)}
            >
              <option value="">No world yet</option>
              {availableWorlds
                .filter((world) => !universeId || String(world.universe_id) === universeId)
                .map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.name}
                  </option>
                ))}
            </select>

            <div className="resource-field-grid">
              <div>
                <label htmlFor="resource-full-name">Full name</label>
                <input
                  id="resource-full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="resource-nickname">Nickname</label>
                <input
                  id="resource-nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="resource-age">Age</label>
                <input
                  id="resource-age"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="resource-occupation">Occupation</label>
                <input
                  id="resource-occupation"
                  value={occupation}
                  onChange={(event) => setOccupation(event.target.value)}
                />
              </div>
            </div>

            <label htmlFor="resource-appearance">Appearance</label>
            <textarea
              id="resource-appearance"
              value={appearance}
              onChange={(event) => setAppearance(event.target.value)}
              placeholder="Describe visual details, style, or presence."
            />
          </>
        ) : null}

        {archiveStatus === 'error' ? (
          <p className="form-message error">{archiveError}</p>
        ) : null}

        <label className="checkbox-row" htmlFor="universe-public">
          <input
            id="universe-public"
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />
          Public {config.loadingLabel}
        </label>

        {config.hasImages ? (
          <fieldset className="image-upload-fieldset">
            <legend>{config.imageLegend}</legend>
            <ImageCropInput
              id="universe-portrait"
              label="Portrait image"
              mode="portrait"
              onCroppedFile={setPortraitFile}
            />
            <ImageCropInput
              id="universe-cover"
              label="Cover image"
              mode="cover"
              onCroppedFile={setCoverFile}
            />
            <label htmlFor="universe-gallery">Gallery images</label>
            <input
              id="universe-gallery"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              type="file"
              onChange={(event) =>
                setGalleryFiles(Array.from(event.target.files || []))
              }
            />
            <p>
              Save after choosing files. Uploaded gallery images can be inserted
              into the article from the image library below.
            </p>
          </fieldset>
        ) : null}

        <div className="editor-tabs" role="tablist" aria-label="Description editor">
          <button
            aria-selected={editorTab === 'friendly'}
            role="tab"
            type="button"
            onClick={() => switchEditorTab('friendly')}
          >
            Friendly editor
          </button>
          <button
            aria-selected={editorTab === 'html'}
            role="tab"
            type="button"
            onClick={() => switchEditorTab('html')}
          >
            HTML editor
          </button>
        </div>

        {editorTab === 'friendly' ? (
          <div className="friendly-editor-panel" role="tabpanel">
            <label htmlFor="friendly-intro">Introduction</label>
            <textarea
              id="friendly-intro"
              value={friendlyArticle.intro}
              onChange={(event) =>
                setFriendlyArticle((current) => ({
                  ...current,
                  intro: event.target.value,
                }))
              }
              placeholder={config.introPlaceholder}
            />

            <div className="friendly-section-header">
              <h3>Article sections</h3>
              <button type="button" onClick={addSection}>
                Add section
              </button>
            </div>

            {friendlyArticle.sections.map((section, index) => (
              <article className="friendly-section-editor" key={index}>
                <label htmlFor={`section-title-${index}`}>Section title</label>
                <input
                  id={`section-title-${index}`}
                  value={section.title}
                  onChange={(event) =>
                    updateSection(index, 'title', event.target.value)
                  }
                />
                <label htmlFor={`section-body-${index}`}>Section text</label>
                <textarea
                  id={`section-body-${index}`}
                  value={section.body}
                  onChange={(event) =>
                    updateSection(index, 'body', event.target.value)
                  }
                  placeholder="Write this section in plain text."
                />
                <button type="button" onClick={() => removeSection(index)}>
                  Remove section
                </button>
              </article>
            ))}

            <p className="editor-help">
              Write in plain text here. Each section title becomes a Contents
              link automatically on the article page.
            </p>
          </div>
        ) : (
          <div className="html-editor-panel" role="tabpanel">
            <label htmlFor="resource-description">Article HTML</label>
            <div className="snippet-toolbar" aria-label="Insert snippets">
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet('<h2>History</h2>\n<p>Write a new section...</p>')
                }
              >
                Heading
              </button>
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet(
                    '<img src="https://example.com/image.jpg" alt="Describe the image">',
                  )
                }
              >
                Image
              </button>
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet('<blockquote>Important quote or lore note.</blockquote>')
                }
              >
                Quote
              </button>
            </div>
            <textarea
              id="resource-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={`<h2>Overview</h2><p>Write your ${config.loadingLabel} article here.</p>`}
            />
            <p className="editor-help">
              Use HTML for structure: <code>&lt;h2&gt;</code> and{' '}
              <code>&lt;h3&gt;</code> become the Contents links automatically.
              External images work with{' '}
              <code>&lt;img src=&quot;https://...&quot; alt=&quot;...&quot;&gt;</code>.
              For uploaded images, save the files first, then use the Insert
              button in the image library.
            </p>
          </div>
        )}

        {kind === 'characters' ? (
          <>
            <label htmlFor="resource-story">Backstory</label>
            <textarea
              id="resource-story"
              value={story}
              onChange={(event) => setStory(event.target.value)}
              placeholder="Write backstory, arcs, or narrative notes."
            />
          </>
        ) : null}

        <button type="submit" disabled={!canSave}>
          {saveStatus === 'loading' ? 'Saving...' : `Save ${config.loadingLabel}`}
        </button>
        {message ? (
          <p className={`form-message ${saveStatus}`}>{message}</p>
        ) : null}
      </form>

      <aside className="wiki-preview-card">
        <h2>Preview</h2>
        {config.hasImages && attachedImages.length > 0 ? (
          <div className="attached-image-library">
            <h3>Image library</h3>
            <p>Insert an uploaded image into the article body.</p>
            <div>
              {attachedImages.map(({ attachment, label }) => (
                <article key={`${label}-${attachment.url}`}>
                  <img src={attachmentUrl(attachment)} alt="" />
                  <div>
                    <strong>{label}</strong>
                    <span>{attachment.filename}</span>
                    <button
                      type="button"
                      onClick={() => appendAttachedImage(attachment)}
                    >
                      Insert
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : config.hasImages ? (
          <div className="attached-image-library empty">
            <h3>Image library</h3>
            <p>
              Upload and save images to create reusable article image snippets.
            </p>
          </div>
        ) : null}
        <div
          className="wiki-body"
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      </aside>
    </div>
  )
}
