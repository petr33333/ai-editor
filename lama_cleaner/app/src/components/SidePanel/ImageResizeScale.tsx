import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { appState, croperState, settingState } from '../../store/Atoms'
import Slider from '../Editor/Slider'
import SettingBlock from '../Settings/SettingBlock'

const ImageResizeScale = () => {
  const [setting, setSettingState] = useRecoilState(settingState)
  const app = useRecoilValue(appState)
  const croper = useRecoilValue(croperState)

  const handleSliderChange = (value: number) => {
    setSettingState(old => {
      return { ...old, sdScale: value }
    })
  }

  const scaledWidth = () => {
    let width = app.imageWidth
    if (setting.showCroper) {
      width = croper.width
    }
    return Math.round((width * setting.sdScale) / 100)
  }

  const scaledHeight = () => {
    let height = app.imageHeight
    if (setting.showCroper) {
      height = croper.height
    }
    return Math.round((height * setting.sdScale) / 100)
  }

  return (
    <SettingBlock
      className="sub-setting-block"
      title="Změnit velikost"
      titleSuffix={
        <div className="resize-title-tile">{` ${scaledWidth()}x${scaledHeight()}`}</div>
      }
      desc="Změňte velikost obrázku před domalováním, oblast mimo masku neztratí na kvalitě."
      input={
        <Slider
          label=""
          width={70}
          min={50}
          max={100}
          value={setting.sdScale}
          onChange={handleSliderChange}
        />
      }
    />
  )
}

export default ImageResizeScale
