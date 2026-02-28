import { useEffect, useMemo, useState } from 'react'
import styles from './AppImage.module.css'

const DEFAULT_FALLBACK = '/images/placeholder.jpg'

export default function AppImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  onLoad,
  onError,
  ...props
}) {
  const resolvedSrc = useMemo(() => {
    if (typeof src === 'string' && src.trim()) return src.trim()
    return fallbackSrc
  }, [src, fallbackSrc])

  const [currentSrc, setCurrentSrc] = useState(resolvedSrc)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCurrentSrc(resolvedSrc)
    setIsLoading(true)
  }, [resolvedSrc])

  const handleLoad = (event) => {
    setIsLoading(false)
    if (onLoad) onLoad(event)
  }

  const handleError = (event) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
      return
    }

    setIsLoading(false)
    if (onError) onError(event)
  }

  return (
    <span className={`${styles.wrap} ${wrapperClassName} ${isLoading ? styles.loading : ''}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`${styles.img} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...props}
      />
      <span className={styles.shimmer} aria-hidden="true" />
    </span>
  )
}
