import React from 'react'

/**
 * Focusync brand mark (brain + gear icon).
 * `variant="icon"` renders just the icon mark (for nav bars, avatars, headers).
 * `variant="full"` renders the full lockup with the "Focusync" wordmark baked in
 * (best for splash/onboarding screens where the wordmark isn't repeated separately).
 */
export default function Logo({ size = 36, variant = 'icon', className = '' }) {
  const src = variant === 'full' ? '/brand/logo-full.png' : '/brand/logo-icon.png'
  return (
    <img
      src={src}
      alt="Focusync"
      style={{ width: size, height: variant === 'full' ? 'auto' : size }}
      className={`select-none object-contain ${className}`}
      draggable={false}
    />
  )
}
