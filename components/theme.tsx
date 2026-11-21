'use client'
import { useEffect, useState } from 'react'

export function Theme() {
  const [light, setLight] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const initial = saved ? saved === 'light' : matchMedia('(prefers-color-scheme: light)').matches
    document.documentElement.dataset.theme = initial ? 'light' : 'dark'
    setLight(initial)
  }, [])
  return <button className="theme" type="button" aria-label="Light theme" aria-pressed={light} onClick={() => {
    const theme = light ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
    setLight(!light)
  }}><span aria-hidden="true">{light ? '☾' : '☀'}</span></button>
}
