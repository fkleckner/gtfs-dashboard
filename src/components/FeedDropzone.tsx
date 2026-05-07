import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
}

export function FeedDropzone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className="dropzone-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
          <polyline points="8 12 12 8 16 12"/>
          <line x1="12" y1="8" x2="12" y2="20"/>
        </svg>
      </div>
      <p className="dropzone-title">Drop a GTFS feed here</p>
      <p className="dropzone-sub">or click to browse — accepts .zip files</p>
      <p className="dropzone-hint">Try the <a href="https://www.stm.info/en/about/developers" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>STM Montreal feed</a> to get started</p>
    </div>
  )
}
