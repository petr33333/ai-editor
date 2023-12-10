import React, { ReactNode } from 'react'
import { useRecoilState } from 'recoil'
import { hdSettingsState, settingState } from '../../store/Atoms'
import Selector from '../shared/Selector'
import NumberInputSetting from './NumberInputSetting'
import SettingBlock from './SettingBlock'

export enum HDStrategy {
  ORIGINAL = 'Original',
  RESIZE = 'Resize',
  CROP = 'Crop',
}

export enum LDMSampler {
  ddim = 'ddim',
  plms = 'plms',
}

function HDSettingBlock() {
  const [hdSettings, setHDSettings] = useRecoilState(hdSettingsState)
  if (!hdSettings?.enabled) {
    return <></>
  }

  const onStrategyChange = (value: HDStrategy) => {
    setHDSettings({ hdStrategy: value })
  }

  const onResizeLimitChange = (value: string) => {
    const val = value.length === 0 ? 0 : parseInt(value, 10)
    setHDSettings({ hdStrategyResizeLimit: val })
  }

  const onCropTriggerSizeChange = (value: string) => {
    const val = value.length === 0 ? 0 : parseInt(value, 10)
    setHDSettings({ hdStrategyCropTrigerSize: val })
  }

  const onCropMarginChange = (value: string) => {
    const val = value.length === 0 ? 0 : parseInt(value, 10)
    setHDSettings({ hdStrategyCropMargin: val })
  }

  const renderOriginalOptionDesc = () => {
    return (
      <div>
        Použijte originální obrázek vhodný pro velikost obrázku menší než 2K{' '}
        <div
          tabIndex={0}
          role="button"
          className="inline-tip"
          onClick={() => onStrategyChange(HDStrategy.RESIZE)}
        >
          Změna velikosti
        </div>
        {' or '}
        <div
          tabIndex={0}
          role="button"
          className="inline-tip"
          onClick={() => onStrategyChange(HDStrategy.CROP)}
        >
          Oříznutí
        </div>{' '}
        pokud jste měli problémy s generací
      </div>
    )
  }

  const renderResizeOptionDesc = () => {
    return (
      <>
        <div>
          Změňte velikost delší strany obrázku na určitou velikost a poté
          proveďte malbu na obrázek se změněnou velikostí.
        </div>
        <NumberInputSetting
          title="limit velikosti"
          value={`${hdSettings.hdStrategyResizeLimit}`}
          suffix="pixel"
          onValue={onResizeLimitChange}
        />
      </>
    )
  }

  const renderCropOptionDesc = () => {
    return (
      <>
        <div>
          Ořízněte maskovací oblast z původního obrázku abyste mohli provést
          malbu
        </div>
        <NumberInputSetting
          title="Trigger velikosti"
          value={`${hdSettings.hdStrategyCropTrigerSize}`}
          suffix="pixel"
          onValue={onCropTriggerSizeChange}
        />
        <NumberInputSetting
          title="Odsazení oříznutí"
          value={`${hdSettings.hdStrategyCropMargin}`}
          suffix="pixel"
          onValue={onCropMarginChange}
        />
      </>
    )
  }

  const renderHDStrategyOptionDesc = (): ReactNode => {
    switch (hdSettings.hdStrategy) {
      case HDStrategy.ORIGINAL:
        return renderOriginalOptionDesc()
      case HDStrategy.CROP:
        return renderCropOptionDesc()
      case HDStrategy.RESIZE:
        return renderResizeOptionDesc()
      default:
        return renderOriginalOptionDesc()
    }
  }

  return (
    <SettingBlock
      className="hd-setting-block"
      title="Proces"
      input={
        <Selector
          width={80}
          value={hdSettings.hdStrategy as string}
          options={Object.values(HDStrategy)}
          onChange={val => onStrategyChange(val as HDStrategy)}
        />
      }
      optionDesc={renderHDStrategyOptionDesc()}
    />
  )
}

export default HDSettingBlock
