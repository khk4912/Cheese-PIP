import { storage } from '#imports'
import { OPTIONS_STORAGE_KEY } from './options'
import { KEYBINDINGS_STORAGE_KEY } from './keyBindings'

/**
 * 옵션과 단축키를 기본값으로 되돌립니다. 즐겨찾기 등 사용자 데이터는 유지합니다.
 */
export async function resetSettings(): Promise<void> {
  await storage.removeItems([OPTIONS_STORAGE_KEY, KEYBINDINGS_STORAGE_KEY])
}
