/**
 * 저장된 값을 기본값 위에 병합합니다.
 * 새 버전에서 추가된 키는 기본값을 사용하고, 더 이상 쓰지 않는 키는 버립니다.
 */
export function mergeStoredObject<T extends object>(defaults: T, stored?: Partial<T> | null): T {
  const merged = { ...defaults }

  if (!stored) {
    return merged
  }

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = stored[key]
    if (value !== undefined) {
      merged[key] = value
    }
  }

  return merged
}
