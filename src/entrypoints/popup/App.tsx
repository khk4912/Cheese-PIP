import './style.css'
import Option from '@/components/options/Option'

export default function App (): React.ReactNode {
  return (
    <>
      <div>
        <Header />
      </div>
      <ModalProvider>
        <OptionView>
          <Option>
            <Option.Header title='녹화' desc='방송 화면에 녹화 버튼을 추가합니다.' />
            <Option.CheckButton optionID='rec' />
          </Option>
          <Option>
            <Option.Header title='스크린샷' desc='방송 화면에 스크린샷 버튼을 추가합니다.' />
            <Option.CheckButton optionID='screenshot' />
          </Option>
          <Option>
            <Option.Header
              title='방향키 탐색'
              desc='방향키를 이용하여 방송의 이전 내용으로 돌아갈 수 있습니다.
                   (타임머신 기능과 충돌이 있을 수 있어요.)'
            />
            <Option.CheckButton optionID='seek' />
          </Option>
          <Option>
            <Option.Header title='영상 빠른 저장' desc='영상 녹화 완료 페이지 표시 없이 즉시 녹화 파일을 저장합니다.' />
            <Option.CheckButton optionID='fastRec' />
          </Option>
          <Option>
            <Option.Header
              title='스크린샷 미리보기'
              desc='스크린샷 촬영 후 미리보기를 사용합니다.
                  (미리보기를 사용하지 않으면 촬영한 스크린샷은 즉시 저장됩니다.)'
            />
            <Option.CheckButton optionID='screenshotPreview' />
          </Option>
          <Option>
            <Option.Header
              title='팔로우 즐겨찾기 (베타)'
              desc='팔로우 중인 스트리머 중 특정 스트리머를 즐겨찾기 탭에 추가할 수 있습니다.'
            />
            <Option.CheckButton optionID='favorites' />
          </Option>
          <Option>
            <Option.Header
              title='자동 해상도 변경'
              desc='방송 해상도를 최고 품질로 자동으로 변경합니다.'
            />
            <Option.CheckButton optionID='preferHQ' />
          </Option>
          <Option>
            <Option.Header
              title='PIP+ (베타)'
              desc='방송 화면에 PIP+ 버튼을 추가합니다.
                    PIP+는 기본 PIP보다 확장된 기능을 제공합니다.'
            />
            <Option.CheckButton optionID='pip' />
          </Option>

          <Collapsable
            title='고급 옵션'
            desc='확장 프로그램의 작동 방식에 큰 변화를 주는 옵션들입니다.
                이 옵션들을 변경하면 오류가 발생할 수 있습니다.
                옵션을 변경한 후 정상적으로 작동하는지 확인해주세요.'
          >
            <Option>
              <Option.Header
                title='MP4 선호'
                desc='영상 녹화 시 브라우저가 지원하는 경우 MP4(AAC)로 녹화합니다.'
              />
              <Option.CheckButton optionID='preferMP4' />
            </Option>
            <Option>
              <Option.Header
                title='고프레임 녹화'
                desc='영상 녹화 시 최대 60fps로 녹화합니다.'
              />
              <Option.CheckButton optionID='highFrameRateRec' />
            </Option>

            <Option>
              <Option.Header
                title='녹화 비트레이트'
                desc='녹화 시 사용할 비트레이트를 설정합니다.
                    단위는 bps(초당 비트)입니다.

                    (기본값: 4000000)'
              />
              <Option.NumberInput
                optionID='videoBitsPerSecond'
                min={1000}
                max={25000000}
              />
            </Option>
          </Collapsable>

          <div style={{ display: 'flex' }}>
            <ShortcutOptionButton />
            <Modal />
            <ResetButton />
          </div>
        </OptionView>

        <footer>
          <Footer />
        </footer>
      </ModalProvider>
    </>
  )
}
