export async function setMaxHQ (): Promise<void> {
  const original = await waitForElement('.pzp-setting-quality-pane__list-container > ul > li') as HTMLLIElement

  const temp = original.cloneNode(true) as HTMLLIElement
  original.replaceWith(temp)

  temp.click()

  requestAnimationFrame(() => {
    temp.replaceWith(original)
  })
}
