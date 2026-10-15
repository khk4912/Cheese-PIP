import { storage } from '#imports'
import { mergeStoredObject } from './merge'

export interface BooleanOptions {
  pip: boolean
  rec: boolean
  fastRec: boolean
  seek: boolean
  screenshot: boolean
  screenshotPreview: boolean
  highFrameRateRec: boolean
  preferMP4: boolean
  preferHQ: boolean
  autoPIP: boolean
  favorites: boolean
}

export interface NumberOptions {
  videoBitsPerSecond: number
}

export type BooleanOptionKey = keyof BooleanOptions

export interface CheesePIPOptions extends BooleanOptions, NumberOptions {}

export const OPTIONS_STORAGE_KEY = 'local:options' as const

export const DEFAULT_OPTIONS: CheesePIPOptions = {
  pip: false,
  rec: true,
  fastRec: false,
  seek: false,
  screenshot: true,
  screenshotPreview: true,
  highFrameRateRec: false,
  preferMP4: false,
  videoBitsPerSecond: 4000000,
  preferHQ: false,
  autoPIP: true,
  favorites: false,
}

export function mergeOptions(options?: Partial<CheesePIPOptions> | null): CheesePIPOptions {
  return mergeStoredObject(DEFAULT_OPTIONS, options)
}

export async function getOptions(): Promise<CheesePIPOptions> {
  const options = await storage.getItem<Partial<CheesePIPOptions>>(OPTIONS_STORAGE_KEY)
  return mergeOptions(options)
}

export async function setOptions(options: Partial<CheesePIPOptions>): Promise<void> {
  await storage.setItem<CheesePIPOptions>(OPTIONS_STORAGE_KEY, mergeOptions(options))
}
