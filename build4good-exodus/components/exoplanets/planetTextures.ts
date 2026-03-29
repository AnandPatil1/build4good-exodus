'use client'

import textureKepler442b from './Gemini_Generated_Image_19p00e19p00e19p0.png'
import textureProximaCentauriB from './Gemini_Generated_Image_5cr45b5cr45b5cr4.png'
import textureTrappist1e from './Gemini_Generated_Image_6u19xx6u19xx6u19.png'
import textureToi700d from './Gemini_Generated_Image_icolobicolobicol.png'
import textureKepler1649c from './Gemini_Generated_Image_iu1dmpiu1dmpiu1d.png'
import textureLhs1140b from './Gemini_Generated_Image_zcbohxzcbohxzcbo.png'
import textureK218b from './close-up-oil-painting-texture.jpg'
import textureGj1061d from './green-water-with-foam.jpg'
import textureTeegardensStarB from './4k_makemake_fictional.jpg'
import textureWolf1069b from './4k_ceres_fictional.jpg'

const ORDERED_PLANET_TEXTURE_SOURCES = [
  textureKepler442b.src,
  textureProximaCentauriB.src,
  textureTrappist1e.src,
  textureToi700d.src,
  textureKepler1649c.src,
  textureLhs1140b.src,
  textureK218b.src,
  textureGj1061d.src,
  textureTeegardensStarB.src,
  textureWolf1069b.src,
] as const

const PLANET_TEXTURE_SOURCES: Record<string, string> = {
  'kepler-442b': ORDERED_PLANET_TEXTURE_SOURCES[0],
  'proxima-centauri-b': ORDERED_PLANET_TEXTURE_SOURCES[1],
  'trappist-1e': ORDERED_PLANET_TEXTURE_SOURCES[2],
  'toi-700-d': ORDERED_PLANET_TEXTURE_SOURCES[3],
  'kepler-1649c': ORDERED_PLANET_TEXTURE_SOURCES[4],
  'lhs-1140b': ORDERED_PLANET_TEXTURE_SOURCES[5],
  'k2-18b': ORDERED_PLANET_TEXTURE_SOURCES[6],
  'gj-1061d': ORDERED_PLANET_TEXTURE_SOURCES[7],
  "teegarden's-star-b": ORDERED_PLANET_TEXTURE_SOURCES[8],
  'wolf-1069b': ORDERED_PLANET_TEXTURE_SOURCES[9],
}

export function getPlanetTextureSource(planetId: string, index?: number) {
  const mappedTexture = PLANET_TEXTURE_SOURCES[planetId]

  if (mappedTexture) {
    return mappedTexture
  }

  if (index === undefined) {
    return null
  }

  return ORDERED_PLANET_TEXTURE_SOURCES[index] ?? null
}
