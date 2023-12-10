import React, { useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useToggle } from 'react-use'
import { UploadIcon } from '@radix-ui/react-icons'
import {
  isInpaintingState,
  paintByExampleImageState,
  settingState,
} from '../../store/Atoms'
import NumberInputSetting from '../Settings/NumberInputSetting'
import SettingBlock from '../Settings/SettingBlock'
import { Switch, SwitchThumb } from '../shared/Switch'
import Button from '../shared/Button'
import emitter, { EVENT_PAINT_BY_EXAMPLE } from '../../event'
import { useImage } from '../../utils'
import ImageResizeScale from './ImageResizeScale'

const INPUT_WIDTH = 30

const PESidePanel = () => {
  const [open, toggleOpen] = useToggle(true)
  const [setting, setSettingState] = useRecoilState(settingState)
  const [paintByExampleImage, setPaintByExampleImage] = useRecoilState(
    paintByExampleImageState
  )
  const [uploadElemId] = useState(
    `example-file-upload-${Math.random().toString()}`
  )
  const [exampleImage, isExampleImageLoaded] = useImage(paintByExampleImage)
  const isInpainting = useRecoilValue(isInpaintingState)

  const renderUploadIcon = () => {
    return (
      <label htmlFor={uploadElemId}>
        <Button
          border
          toolTip="Nahrajte příkladový obrázek"
          icon={<UploadIcon />}
          style={{ padding: '0.3rem', gap: 0 }}
        >
          <input
            style={{ display: 'none' }}
            id={uploadElemId}
            name={uploadElemId}
            type="file"
            onChange={ev => {
              const newFile = ev.currentTarget.files?.[0]
              if (newFile) {
                setPaintByExampleImage(newFile)
              }
            }}
            accept="image/png, image/jpeg"
          />
        </Button>
      </label>
    )
  }

  return (
    <div className="side-panel">
      <PopoverPrimitive.Root open={open}>
        <PopoverPrimitive.Trigger
          className="btn-primary side-panel-trigger"
          onClick={() => toggleOpen()}
        >
          Nastavení
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content className="side-panel-content">
            <SettingBlock
              title="Oříznutí"
              input={
                <Switch
                  checked={setting.showCroper}
                  onCheckedChange={value => {
                    setSettingState(old => {
                      return { ...old, showCroper: value }
                    })
                  }}
                >
                  <SwitchThumb />
                </Switch>
              }
            />

            <ImageResizeScale />

            <NumberInputSetting
              title="Počet fází"
              width={INPUT_WIDTH}
              value={`${setting.paintByExampleSteps}`}
              desc="Počet kroků odšumování. Více kroků odšumování obvykle vede k vyšší kvalitě obrazu na úkor pomalejšího vyvozování."
              onValue={value => {
                const val = value.length === 0 ? 0 : parseInt(value, 10)
                setSettingState(old => {
                  return { ...old, paintByExampleSteps: val }
                })
              }}
            />

            <NumberInputSetting
              title="Váha zadání"
              width={INPUT_WIDTH}
              allowFloat
              value={`${setting.paintByExampleGuidanceScale}`}
              desc="Vyšší naváděcí měřítko podporuje generování obrázků, které jsou blízké vzorovému obrázku"
              onValue={value => {
                const val = value.length === 0 ? 0 : parseFloat(value)
                setSettingState(old => {
                  return { ...old, paintByExampleGuidanceScale: val }
                })
              }}
            />

            <NumberInputSetting
              title="Rozmazání masky"
              width={INPUT_WIDTH}
              value={`${setting.paintByExampleMaskBlur}`}
              desc="Rozostřete okraj oblasti masky. Čím vyšší číslo, tím hladší prolnutí s původním obrázkem"
              onValue={value => {
                const val = value.length === 0 ? 0 : parseInt(value, 10)
                setSettingState(old => {
                  return { ...old, paintByExampleMaskBlur: val }
                })
              }}
            />

            <SettingBlock
              title="Histogramy"
              desc="Porovnejte histogram výsledku malby s histogramem zdrojového obrázku, zlepší se kvalita malby u některých obrázků."
              input={
                <Switch
                  checked={setting.paintByExampleMatchHistograms}
                  onCheckedChange={value => {
                    setSettingState(old => {
                      return { ...old, paintByExampleMatchHistograms: value }
                    })
                  }}
                >
                  <SwitchThumb />
                </Switch>
              }
            />

            <SettingBlock
              title="Seed generace"
              input={
                <div
                  style={{
                    display: 'flex',
                    gap: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* 每次会从服务器返回更新该值 */}
                  <NumberInputSetting
                    title=""
                    width={80}
                    value={`${setting.paintByExampleSeed}`}
                    desc=""
                    disable={!setting.paintByExampleSeedFixed}
                    onValue={value => {
                      const val = value.length === 0 ? 0 : parseInt(value, 10)
                      setSettingState(old => {
                        return { ...old, paintByExampleSeed: val }
                      })
                    }}
                  />
                  <Switch
                    checked={setting.paintByExampleSeedFixed}
                    onCheckedChange={value => {
                      setSettingState(old => {
                        return { ...old, paintByExampleSeedFixed: value }
                      })
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    <SwitchThumb />
                  </Switch>
                </div>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SettingBlock
                title="Příkladový obrázek"
                input={renderUploadIcon()}
              />

              {paintByExampleImage ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={exampleImage.src}
                    alt="příklad"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      margin: 12,
                    }}
                  />
                </div>
              ) : (
                <></>
              )}
            </div>

            <Button
              border
              disabled={!isExampleImageLoaded || isInpainting}
              style={{ width: '100%' }}
              onClick={() => {
                if (isExampleImageLoaded) {
                  emitter.emit(EVENT_PAINT_BY_EXAMPLE, {
                    image: paintByExampleImage,
                  })
                }
              }}
            >
              Generovat
            </Button>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}

export default PESidePanel
