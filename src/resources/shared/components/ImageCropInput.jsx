import { useEffect, useMemo, useRef, useState } from 'react'

const CROP_PRESETS = {
  cover: {
    aspect: 126 / 23,
    outputHeight: 460,
    outputWidth: 2520,
  },
  portrait: {
    aspect: 4 / 5,
    outputHeight: 1000,
    outputWidth: 800,
  },
}

// Keeps a number inside a fixed range for zoom and drag boundaries.
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// Builds a predictable filename for the cropped upload generated in-browser.
function croppedFileName(fileName, mode) {
  const cleanName = fileName.replace(/\.[^.]+$/, '')
  return `${cleanName}-${mode}-crop.jpg`
}

// Renders an image picker that lets users crop cover and portrait uploads.
export function ImageCropInput({ id, label, mode, onCroppedFile }) {
  const preset = CROP_PRESETS[mode]
  const imageRef = useRef(null)
  const previewRef = useRef(null)
  const dragRef = useRef(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [originalFile, setOriginalFile] = useState(null)
  const [imageSize, setImageSize] = useState({ height: 0, width: 0 })
  const [previewSize, setPreviewSize] = useState({ height: 0, width: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [message, setMessage] = useState('')

  const previewStyle = useMemo(
    () => ({ aspectRatio: `${preset.aspect}` }),
    [preset.aspect],
  )

  useEffect(
    // Releases the temporary object URL whenever the selected source image changes or unmounts.
    () => () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    },
    [sourceUrl],
  )

  useEffect(() => {
    const preview = previewRef.current
    if (!preview || !sourceUrl) return undefined

    // Measures the visible crop viewport so canvas math uses rendered dimensions.
    const updatePreviewSize = () => {
      setPreviewSize({
        height: preview.clientHeight,
        width: preview.clientWidth,
      })
    }
    updatePreviewSize()

    const resizeObserver = new ResizeObserver(updatePreviewSize)
    resizeObserver.observe(preview)

    return () => resizeObserver.disconnect()
  }, [sourceUrl])

  // Resets the cropper to its centered, unzoomed state.
  const resetCrop = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setMessage('')
  }

  // Loads a selected image file into the crop preview.
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    setOriginalFile(file)
    setSourceUrl(file ? URL.createObjectURL(file) : '')
    setImageSize({ height: 0, width: 0 })
    setPreviewSize({ height: 0, width: 0 })
    resetCrop()
    onCroppedFile(null)
  }

  // Calculates how the source image fits inside the visible crop viewport.
  const previewMetrics = () => {
    if (
      !previewSize.width ||
      !previewSize.height ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return null
    }

    const viewportWidth = previewSize.width
    const viewportHeight = previewSize.height
    const baseScale = Math.max(
      viewportWidth / imageSize.width,
      viewportHeight / imageSize.height,
    )
    const displayWidth = imageSize.width * baseScale * zoom
    const displayHeight = imageSize.height * baseScale * zoom

    return {
      displayHeight,
      displayWidth,
      viewportHeight,
      viewportWidth,
    }
  }
  const metrics = previewMetrics()

  // Restricts drag offsets so the crop viewport never shows empty space.
  const clampOffset = (nextOffset, nextZoom = zoom) => {
    if (
      !previewSize.width ||
      !previewSize.height ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return nextOffset
    }

    const viewportWidth = previewSize.width
    const viewportHeight = previewSize.height
    const baseScale = Math.max(
      viewportWidth / imageSize.width,
      viewportHeight / imageSize.height,
    )
    const displayWidth = imageSize.width * baseScale * nextZoom
    const displayHeight = imageSize.height * baseScale * nextZoom
    const maxX = Math.max(0, (displayWidth - viewportWidth) / 2)
    const maxY = Math.max(0, (displayHeight - viewportHeight) / 2)

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    }
  }

  // Applies zoom changes and re-clamps the current image offset.
  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value)
    setZoom(nextZoom)
    setOffset((current) => clampOffset(current, nextZoom))
  }

  // Starts a pointer drag for repositioning the crop area.
  const startDrag = (event) => {
    if (!sourceUrl) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  // Updates the crop offset while the pointer is dragging.
  const moveDrag = (event) => {
    if (!dragRef.current) return

    const nextOffset = {
      x: dragRef.current.originX + event.clientX - dragRef.current.clientX,
      y: dragRef.current.originY + event.clientY - dragRef.current.clientY,
    }
    setOffset(clampOffset(nextOffset))
  }

  // Ends the current crop drag interaction.
  const stopDrag = () => {
    dragRef.current = null
  }

  // Draws the selected crop to a canvas and returns it as a File.
  const applyCrop = () => {
    const image = imageRef.current
    const metrics = previewMetrics()
    if (!image || !metrics || !originalFile) return

    const canvas = document.createElement('canvas')
    canvas.width = preset.outputWidth
    canvas.height = preset.outputHeight
    const context = canvas.getContext('2d')
    if (!context) return

    const scaleX = imageSize.width / metrics.displayWidth
    const scaleY = imageSize.height / metrics.displayHeight
    const visibleLeft =
      (metrics.displayWidth - metrics.viewportWidth) / 2 - offset.x
    const visibleTop =
      (metrics.displayHeight - metrics.viewportHeight) / 2 - offset.y

    context.drawImage(
      image,
      visibleLeft * scaleX,
      visibleTop * scaleY,
      metrics.viewportWidth * scaleX,
      metrics.viewportHeight * scaleY,
      0,
      0,
      preset.outputWidth,
      preset.outputHeight,
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        onCroppedFile(
          new File([blob], croppedFileName(originalFile.name, mode), {
            type: 'image/jpeg',
          }),
        )
        setMessage('Crop applied.')
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className={`image-crop-input ${mode}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        accept="image/jpeg,image/png,image/webp,image/gif"
        type="file"
        onChange={handleFileChange}
      />
      {sourceUrl ? (
        <div className="image-crop-panel">
          <div
            className="image-crop-preview"
            ref={previewRef}
            style={previewStyle}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <img
              alt=""
              ref={imageRef}
              src={sourceUrl}
              style={{
                height: metrics ? `${metrics.displayHeight / zoom}px` : '100%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                width: metrics ? `${metrics.displayWidth / zoom}px` : '100%',
              }}
              onLoad={(event) => {
                setImageSize({
                  height: event.currentTarget.naturalHeight,
                  width: event.currentTarget.naturalWidth,
                })
              }}
            />
          </div>
          <label htmlFor={`${id}-zoom`}>Crop zoom</label>
          <input
            id={`${id}-zoom`}
            max="2.6"
            min="1"
            step="0.05"
            type="range"
            value={zoom}
            onChange={handleZoomChange}
          />
          <div className="image-crop-actions">
            <button type="button" onClick={applyCrop}>
              Apply crop
            </button>
            <button type="button" onClick={resetCrop}>
              Center
            </button>
          </div>
          {message ? <p>{message}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
