import { createRoot, type Root } from 'react-dom/client'

export function inject (node: React.ReactNode, target: HTMLElement): Root {
  const root = createRoot(target)
  root.render(node)

  return root
}
