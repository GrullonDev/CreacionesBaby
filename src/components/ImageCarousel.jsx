import { useState } from 'react'

export default function ImageCarousel({ images, alt }) {
  const [selected, setSelected] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div className="carousel">
      <div className="carousel-main">
        <img
          src={images[selected]}
          alt={`${alt} — view ${selected + 1}`}
          className="carousel-image"
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              className="carousel-arrow left"
              onClick={() => setSelected((s) => (s === 0 ? images.length - 1 : s - 1))}
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="carousel-arrow right"
              onClick={() => setSelected((s) => (s === images.length - 1 ? 0 : s + 1))}
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((src, i) => (
            <button
              key={i}
              className={`carousel-thumb ${i === selected ? 'active' : ''}`}
              onClick={() => setSelected(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt={`${alt} thumbnail ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
