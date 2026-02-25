const downloadIcon = `
<svg fill="#ffffff"  version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-249.39 -249.39 987.78 987.78" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M329.2,327.2c-4.5,0-8.1,3.4-8.6,7.9c-3.9,38.6-36.5,68.7-76.2,68.7c-39.6,0-72.2-30.1-76.2-68.7 c-0.5-4.4-4.1-7.9-8.6-7.9h-104c-21.8,0-39.5,17.7-39.5,39.5v82.8c0,21.8,17.7,39.5,39.5,39.5h377.8c21.8,0,39.5-17.7,39.5-39.5 v-82.7c0-21.8-17.7-39.5-39.5-39.5H329.2V327.2z"></path> <path d="M303.5,198.6l-30.9,30.9V28.1C272.6,12.6,260,0,244.5,0l0,0c-15.5,0-28.1,12.6-28.1,28.1v201.4l-30.9-30.9 c-9.5-9.5-24.7-11.9-35.9-4.4c-15.3,10.2-16.8,31.1-4.5,43.4l82.8,82.8c9.2,9.2,24.1,9.2,33.3,0l82.8-82.8 c12.3-12.3,10.8-33.2-4.5-43.4C328.2,186.6,313,189,303.5,198.6z"></path> </g> </g> </g></svg>
`

/**
 * 드래그 가능한 이미지 미리보기를 생성합니다.
 *
 * @param imageDataURL 이미지의 dataURL
 * @param fileName 다운로드 시 사용할 파일 이름
 */
export function createDraggablePreview (
  imageDataURL: string,
  fileName: string
): void {
  const preview = document.createElement('img')
  preview.classList.add('cheese-pip', 'screenshot-preview')

  preview.src = imageDataURL
  preview.style.cssText = `
    position: absolute;
    width: 100%;
    height: auto;

    `

  const wrappedOverlay = wrapWithOverlay(preview, fileName)
  wrappedOverlay.style.cssText = `
    position: absolute;
    left: 15%;
    top: 5%;
    cursor: move;
    width: 40%;
    aspect-ratio: 16/9;
    z-index: 15000;
    max-width: 500px;
    `

  const target = document.querySelector('[class^="toolbar_container"]') ??
                 document.querySelector('[class^="layout_glive"]')

  if (target === null) {
    return
  }

  target.parentNode?.insertBefore(wrappedOverlay, target)

  let startPosX = 0
  let startPosY = 0

  wrappedOverlay.addEventListener('mousedown', (e) => {
    const mouseMove = (e: MouseEvent): void => {
      const newPosX = startPosX - e.clientX
      const newPosY = startPosY - e.clientY

      wrappedOverlay.style.left = `${wrappedOverlay.offsetLeft - newPosX}px`
      wrappedOverlay.style.top = `${wrappedOverlay.offsetTop - newPosY}px`

      startPosX = e.clientX
      startPosY = e.clientY
    }

    e.preventDefault() // 이미지 드래그 방지

    startPosX = e.clientX
    startPosY = e.clientY

    document.addEventListener('mousemove', mouseMove)

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', mouseMove)
    })
  })
}

function wrapWithOverlay (img: HTMLImageElement, fileName: string): HTMLDivElement {
  const overlay = document.createElement('div')
  const cover = document.createElement('div')

  const downloadButton = document.createElement('a')
  downloadButton.innerHTML = downloadIcon
  downloadButton.classList.add('chzzk-screenshot-download')
  downloadButton.style.cssText = `
  width: 7%;
  aspect-ratio: 1/1; 
  position: absolute;
  top: 2%;
  right: 3%;
  padding: 1%;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10%;
  `

  const closeButton = document.createElement('a')
  closeButton.innerHTML = `
  <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-230.39 -230.39 921.55 921.55" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.8431000000000002"></g><g id="SVGRepo_iconCarrier"> <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"></path> </g></svg>  `
  closeButton.style.cssText = `
  width: 7%;
  aspect-ratio: 1/1; 
  position: absolute;
  top: 2%;
  left: 3%;
  color: white;
  text-align: center;
  padding: 1%;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10%;
  `

  closeButton.addEventListener('click', () => {
    overlay.remove()
  })

  downloadButton.addEventListener('click', () => {
    downloadAtag(img.src, fileName, 'png')
    overlay.remove()
  })

  cover.append(downloadButton, closeButton)

  overlay.classList.add('chzzk-screenshot-overlay')
  cover.classList.add('chzzk-screenshot-cover')

  overlay.appendChild(img)
  overlay.appendChild(cover)

  return overlay
}
