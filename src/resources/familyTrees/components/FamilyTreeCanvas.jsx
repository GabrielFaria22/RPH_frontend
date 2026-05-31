import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

const RELATION_TYPES = [
  'parent',
  'child',
  'sibling',
  'spouse',
  'partner',
  'ancestor',
  'descendant',
  'guardian',
  'ward',
  'other',
]
const NODE_WIDTH = 176
const NODE_HEIGHT = 96

// Gives each character a stable canvas node id derived from its database id.
function characterNodeId(characterId) {
  return `character-${characterId}`
}

// Coerces saved layout JSON into the exact shape the canvas expects.
function normalizeLayout(layout = {}) {
  return {
    nodes: Array.isArray(layout.nodes) ? layout.nodes : [],
    edges: Array.isArray(layout.edges) ? layout.edges : [],
    viewport: {
      x: Number(layout.viewport?.x || 0),
      y: Number(layout.viewport?.y || 0),
      zoom: Number(layout.viewport?.zoom || 1),
    },
  }
}

// Renders the interactive family tree, including read-only browsing and edit-mode layout tools.
export function FamilyTreeCanvas({
  characters,
  familyTree,
  mode,
  onSave,
  saveStatus,
}) {
  const isEditing = mode === 'edit'
  const stageRef = useRef(null)
  const centeredTreeIdRef = useRef('')
  const [layout, setLayout] = useState(() => normalizeLayout(familyTree.layout))
  const [search, setSearch] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState('')
  const [selectedEdgeId, setSelectedEdgeId] = useState('')
  const [dragState, setDragState] = useState(null)
  const [panState, setPanState] = useState(null)
  const [newCharacterId, setNewCharacterId] = useState('')
  const [edgeSourceId, setEdgeSourceId] = useState('')
  const [edgeTargetId, setEdgeTargetId] = useState('')
  const [edgeType, setEdgeType] = useState('parent')

  // Indexes characters by id so nodes can resolve their display data quickly.
  const characterById = useMemo(
    () =>
      new Map(
        characters.map((character) => [String(character.id), character]),
      ),
    [characters],
  )
  const nodes = layout.nodes
  const edges = layout.edges
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  const selectedCharacter = selectedNode
    ? characterById.get(String(selectedNode.character_id))
    : null
  const relationSourceId = edgeSourceId || selectedNodeId
  const canAddEdge =
    Boolean(relationSourceId) &&
    Boolean(edgeTargetId) &&
    relationSourceId !== edgeTargetId
  const availableCharacters = characters.filter(
    (character) =>
      !nodes.some((node) => String(node.character_id) === String(character.id)),
  )
  const matchingCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  // Calculates a viewport that centers a node in the visible stage.
  const centeredViewportForNode = useCallback((node, zoom = layout.viewport.zoom) => {
    const rect = stageRef.current?.getBoundingClientRect()
    const width = rect?.width || 900
    const height = rect?.height || 660

    return {
      x: Math.round(width / 2 - (node.x + NODE_WIDTH / 2) * zoom),
      y: Math.round(height / 2 - (node.y + NODE_HEIGHT / 2) * zoom),
      zoom,
    }
  }, [layout.viewport.zoom])

  useLayoutEffect(() => {
    // On first load for a tree, center the viewport on the first saved node.
    if (!nodes.length || centeredTreeIdRef.current === String(familyTree.id)) return

    centeredTreeIdRef.current = String(familyTree.id)
    setLayout((current) => ({
      ...current,
      viewport: centeredViewportForNode(current.nodes[0], current.viewport.zoom),
    }))
  }, [centeredViewportForNode, familyTree.id, nodes.length])

  // Merges pan/zoom changes into the layout so saving persists the current viewport.
  const updateViewport = (nextViewport) => {
    setLayout((current) => ({
      ...current,
      viewport: {
        ...current.viewport,
        ...nextViewport,
      },
    }))
  }

  // Converts browser pointer coordinates into canvas coordinates after pan and zoom.
  const screenToTreePoint = (clientX, clientY) => {
    const rect = stageRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - layout.viewport.x) / layout.viewport.zoom,
      y: (clientY - rect.top - layout.viewport.y) / layout.viewport.zoom,
    }
  }

  // Begins moving a node while remembering where inside the node the pointer grabbed it.
  const startNodeDrag = (event, node) => {
    if (!isEditing) return
    event.preventDefault()
    event.stopPropagation()
    const point = screenToTreePoint(event.clientX, event.clientY)
    setDragState({
      nodeId: node.id,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
    })
  }

  // Applies either node dragging or stage panning depending on the active pointer state.
  const handlePointerMove = (event) => {
    if (dragState) {
      const point = screenToTreePoint(event.clientX, event.clientY)
      setLayout((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === dragState.nodeId
            ? {
                ...node,
                x: Math.round(point.x - dragState.offsetX),
                y: Math.round(point.y - dragState.offsetY),
              }
            : node,
        ),
      }))
    }

    if (panState) {
      updateViewport({
        x: panState.originX + event.clientX - panState.clientX,
        y: panState.originY + event.clientY - panState.clientY,
      })
    }
  }

  // Clears drag and pan state when the pointer interaction ends.
  const stopPointerInteraction = () => {
    setDragState(null)
    setPanState(null)
  }

  // Zooms the tree with the mouse wheel while keeping zoom within a usable range.
  const handleWheel = (event) => {
    event.preventDefault()
    const nextZoom = Math.min(
      2,
      Math.max(0.35, layout.viewport.zoom + (event.deltaY > 0 ? -0.08 : 0.08)),
    )
    updateViewport({ zoom: Number(nextZoom.toFixed(2)) })
  }

  // Starts panning when the user presses the empty canvas instead of a node.
  const handleStagePointerDown = (event) => {
    if (event.target.closest('.family-tree-node')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedNodeId('')
    setSelectedEdgeId('')
    setPanState({
      clientX: event.clientX,
      clientY: event.clientY,
      originX: layout.viewport.x,
      originY: layout.viewport.y,
    })
  }

  // Selects a node and pans the viewport so it is centered.
  const focusNode = (nodeId) => {
    const node = nodes.find((candidate) => candidate.id === nodeId)
    if (!node) return

    setSelectedNodeId(node.id)
    updateViewport(centeredViewportForNode(node))
  }

  // Recenters on the first node, or resets to the origin when the tree has no nodes.
  const resetViewport = () => {
    if (!nodes.length) {
      updateViewport({ x: 0, y: 0, zoom: 1 })
      return
    }

    updateViewport(centeredViewportForNode(nodes[0], 1))
  }

  // Adds an unplaced character to the canvas near the current viewport origin.
  const addCharacterNode = () => {
    if (!newCharacterId) return

    const id = characterNodeId(newCharacterId)
    if (nodes.some((node) => node.id === id)) return

    setLayout((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        {
          id,
          character_id: Number(newCharacterId),
          x: Math.round((120 - current.viewport.x) / current.viewport.zoom),
          y: Math.round((120 - current.viewport.y) / current.viewport.zoom),
        },
      ],
    }))
    setSelectedNodeId(id)
    setNewCharacterId('')
  }

  // Deletes the selected node and any edges connected to it.
  const removeSelectedNode = () => {
    if (!selectedNodeId) return

    setLayout((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== selectedNodeId),
      edges: current.edges.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    }))
    setSelectedNodeId('')
  }

  // Creates a relation edge between two selected canvas nodes.
  const addEdge = () => {
    if (!canAddEdge) return

    const id = `edge-${Date.now()}`
    setLayout((current) => ({
      ...current,
      edges: [
        ...current.edges,
        {
          id,
          source: relationSourceId,
          target: edgeTargetId,
          relation_type: edgeType,
        },
      ],
    }))
    setSelectedEdgeId(id)
    setEdgeSourceId(relationSourceId)
    setEdgeTargetId('')
  }

  // Deletes the currently selected relation edge.
  const removeSelectedEdge = () => {
    if (!selectedEdgeId) return
    setLayout((current) => ({
      ...current,
      edges: current.edges.filter((edge) => edge.id !== selectedEdgeId),
    }))
    setSelectedEdgeId('')
  }

  return (
    <div className="family-tree-workspace">
      <aside className="family-tree-sidebar">
        <label htmlFor="family-tree-search">Search character</label>
        <input
          id="family-tree-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Type a character name"
        />
        {search.trim() ? (
          <div className="family-tree-search-results">
            {matchingCharacters.slice(0, 8).map((character) => {
              const nodeId = characterNodeId(character.id)
              const isInTree = nodes.some((node) => node.id === nodeId)
              return (
                <button
                  disabled={!isInTree}
                  key={character.id}
                  type="button"
                  onClick={() => focusNode(nodeId)}
                >
                  {character.name}
                </button>
              )
            })}
          </div>
        ) : null}

        {selectedCharacter ? (
          <section className="tree-detail-panel">
            <h2>{selectedCharacter.name}</h2>
            <p>{selectedCharacter.description || selectedCharacter.occupation || 'No summary yet.'}</p>
          </section>
        ) : (
          <section className="tree-detail-panel empty">
            <h2>No character selected</h2>
            <p>Select a node to inspect it.</p>
          </section>
        )}

        {isEditing ? (
          <section className="tree-edit-panel">
            <h2>Edit tree</h2>
            <label htmlFor="tree-add-character">Add character</label>
            <select
              id="tree-add-character"
              value={newCharacterId}
              onChange={(event) => setNewCharacterId(event.target.value)}
            >
              <option value="">Choose character</option>
              {availableCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={addCharacterNode}>
              Add character
            </button>
            <button type="button" onClick={removeSelectedNode} disabled={!selectedNodeId}>
              Remove selected character
            </button>

            <label htmlFor="tree-edge-source">Relation source</label>
            <select
              id="tree-edge-source"
              value={relationSourceId}
              onChange={(event) => setEdgeSourceId(event.target.value)}
            >
              <option value="">Choose source or select a node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {characterById.get(String(node.character_id))?.name || node.id}
                </option>
              ))}
            </select>

            <label htmlFor="tree-edge-target">Relation target</label>
            <select
              id="tree-edge-target"
              value={edgeTargetId}
              onChange={(event) => setEdgeTargetId(event.target.value)}
            >
              <option value="">Choose target</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {characterById.get(String(node.character_id))?.name || node.id}
                </option>
              ))}
            </select>

            <label htmlFor="tree-edge-type">Relation type</label>
            <select
              id="tree-edge-type"
              value={edgeType}
              onChange={(event) => setEdgeType(event.target.value)}
            >
              {RELATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <button type="button" onClick={addEdge} disabled={!canAddEdge}>
              Add relation
            </button>
            <button type="button" onClick={removeSelectedEdge} disabled={!selectedEdgeId}>
              Remove selected relation
            </button>
            <button
              className="tree-save-button"
              disabled={saveStatus === 'loading'}
              type="button"
              onClick={() => onSave(layout)}
            >
              {saveStatus === 'loading' ? 'Saving...' : 'Save tree'}
            </button>
          </section>
        ) : null}
      </aside>

      <section className="family-tree-canvas-panel">
        <div className="family-tree-toolbar">
          <button type="button" onClick={() => updateViewport({ zoom: layout.viewport.zoom + 0.1 })}>
            Zoom in
          </button>
          <button type="button" onClick={() => updateViewport({ zoom: Math.max(0.35, layout.viewport.zoom - 0.1) })}>
            Zoom out
          </button>
          <button type="button" onClick={resetViewport}>
            Reset
          </button>
        </div>
        <div
          className="family-tree-stage"
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPointerInteraction}
          onPointerLeave={stopPointerInteraction}
          onWheel={handleWheel}
        >
          <svg className="family-tree-edges">
            <g
              transform={`translate(${layout.viewport.x} ${layout.viewport.y}) scale(${layout.viewport.zoom})`}
            >
              {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.source)
                const target = nodes.find((node) => node.id === edge.target)
                if (!source || !target) return null
                const sourceX = source.x + 88
                const sourceY = source.y + 48
                const targetX = target.x + 88
                const targetY = target.y + 48
                const labelX = (sourceX + targetX) / 2
                const labelY = (sourceY + targetY) / 2
                return (
                  <g key={edge.id || `${edge.source}-${edge.target}`}>
                    <line
                      className={edge.id === selectedEdgeId ? 'selected' : ''}
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedEdgeId(edge.id)
                        setSelectedNodeId('')
                      }}
                    />
                    {edge.relation_type ? (
                      <text x={labelX} y={labelY - 8}>
                        {edge.relation_type.replaceAll('_', ' ')}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </g>
          </svg>
          <div
            className="family-tree-node-layer"
            style={{
              transform: `translate(${layout.viewport.x}px, ${layout.viewport.y}px) scale(${layout.viewport.zoom})`,
            }}
          >
            {nodes.map((node) => {
              const character = characterById.get(String(node.character_id))
              return (
                <article
                  className={`family-tree-node ${node.id === selectedNodeId ? 'selected' : ''}`}
                  key={node.id}
                  style={{ left: node.x, top: node.y }}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedNodeId(node.id)
                    setSelectedEdgeId('')
                    if (isEditing) setEdgeSourceId(node.id)
                  }}
                  onPointerDown={(event) => startNodeDrag(event, node)}
                >
                  <span>{character?.name || `Character #${node.character_id}`}</span>
                  <small>{character?.occupation || character?.nickname || 'Character'}</small>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
