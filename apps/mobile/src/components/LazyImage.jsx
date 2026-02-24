import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

const DEFAULT_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export default function LazyImage(props) {
  const {
    src,
    placeholder = DEFAULT_PLACEHOLDER,
    rootMargin = '200px',
    style,
    ...rest
  } = props || {}

  const wrapperStyle = useMemo(() => {
    if (!style) return style
    if (style && typeof style === 'object' && style.borderRadius && !style.overflow) {
      return { ...style, overflow: 'hidden' }
    }
    return style
  }, [style])

  const imageStyle = useMemo(() => {
    const objectFit = style && typeof style === 'object' ? style.objectFit : undefined
    return { width: '100%', height: '100%', ...(objectFit ? { objectFit } : null) }
  }, [style])

  const isH5 = useMemo(() => {
    try {
      const env = Taro.getEnv()
      return env === Taro.ENV_TYPE.WEB || env === Taro.ENV_TYPE.H5
    } catch (_) {
      return true
    }
  }, [])

  const hostRef = useRef(null)
  const [inView, setInView] = useState(!isH5)

  useEffect(() => {
    if (!isH5) return
    if (!hostRef.current) return
    if (inView) return

    const el = hostRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries && entries[0]
        if (entry && entry.isIntersecting) {
          setInView(true)
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, isH5, rootMargin])

  return (
    <View ref={hostRef} style={wrapperStyle}>
      <Image
        src={inView ? src : placeholder}
        style={imageStyle}
        {...rest}
      />
    </View>
  )
}
