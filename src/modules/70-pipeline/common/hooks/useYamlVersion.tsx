import { useMemo } from 'react'
import { usePipelineLoaderContext } from '../components/PipelineStudio/PipelineLoaderContext/PipelineLoaderContext'

export const YamlVersion = {
  '0': '0',
  '1': '1'
} as const

export type YamlVersion = keyof typeof YamlVersion

export type UseYamlVersion = () => {
  yamlVersion: YamlVersion
  isYamlV1: boolean
}

export const useYamlVersion: UseYamlVersion = () => {
  const { yamlVersion: yamlVersionFromContext } = usePipelineLoaderContext()

  const yamlVersion = (yamlVersionFromContext as YamlVersion) ?? YamlVersion[0]
  const isYamlV1 = yamlVersion === YamlVersion[1]

  const value = useMemo(
    () => ({
      yamlVersion,
      isYamlV1
    }),
    [isYamlV1, yamlVersion]
  )

  return value
}
