'use client'
import { useEffect, useState } from 'react'

export function Theme() {
  const [light, setLight] = useState(false)
  useEffect(() => {
    // The inline script in the document head has already applied the theme.
    setLight(document.documentElement.dataset.theme === 'light')
  }, [])
  return <button className="theme" type="button" aria-pressed={light}
    aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => {
    const theme = light ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
    setLight(!light)
  }}><span aria-hidden="true">{light ? '☾' : '☀'}</span></button>
}
