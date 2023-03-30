import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactToConnectorMap } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

export interface Params {
  oldConnectorRef?: string
  newConnectorRef?: string
  artifactType: ArtifactType
}

export const isConnectorRefUpdated = (params: Params) => {
  const { oldConnectorRef, newConnectorRef, artifactType } = params
  const isConnectorRefApplicable = Boolean(ArtifactToConnectorMap[artifactType])

  return Boolean(isConnectorRefApplicable && oldConnectorRef && newConnectorRef && oldConnectorRef !== newConnectorRef)
}
