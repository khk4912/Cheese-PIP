export async function setMaxHQ (): Promise<void> {
  const original = await waitForElement('ul.pzp-setting-quality-pane__list-container > li') as HTMLLIElement
  const parent = original.parentElement

  const clone = original.cloneNode(true) as HTMLLIElement
  parent?.replaceChild(clone, original)

  original.click()
  requestAnimationFrame(() => parent?.replaceChild(original, clone))
}
