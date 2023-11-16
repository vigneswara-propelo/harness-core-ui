/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { AllowedTypes } from '@harness/uicore'
import { FormikContextType } from 'formik'

import type { ConnectorSelectedValue } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  K8sApplyStepInfo,
  ManifestConfigWrapper,
  StepElementConfig,
  ManifestSourceWrapper,
  PageConnectorResponse,
  ServiceDefinition
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { ManifestTypes, ManifestStepInitData } from '@pipeline/components/ManifestSelection/ManifestInterface'

export interface K8sApplyData extends StepElementConfig {
  spec: Omit<K8sApplyStepInfo, 'skipDryRun' | 'skipSteadyStateCheck' | 'skipRendering'> & {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
    skipRendering?: boolean
  }
}
export interface K8sApplyVariableStepProps {
  initialValues: K8sApplyData
  stageIdentifier: string
  onUpdate?(data: K8sApplyFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sApplyData
}

export interface K8sManifestSource {
  manifestSource?: ManifestSourceWrapper
}

export interface FilePathConfig {
  value: string
  id: string
}
export interface K8sApplyFormData extends StepElementConfig {
  spec: {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
    skipRendering?: boolean
    filePaths?: FilePathConfig[] | string
    overrides?: ManifestConfigWrapper[]
    manifestSource?: ManifestSourceWrapper
  }
}

export interface K8sApplyProps {
  initialValues: K8sApplyData
  onUpdate?: (data: K8sApplyData) => void
  onChange?: (data: K8sApplyData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  isDisabled?: boolean
  inputSetData?: {
    template?: K8sApplyData
    path?: string
  }
  readonly?: boolean
}

export type K8sManifestTypes = 'Values' | 'OpenshiftParam' | 'KustomizePatches'

export type K8sManifestStores = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Inline' | 'Harness' | 'AzureRepo'

export interface K8sManifestStepInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: K8sManifestStores | string
  selectedManifest: K8sManifestTypes | null
}

export interface K8sApplyManifestProps {
  connectors?: PageConnectorResponse | undefined
  isReadonly?: boolean
  deploymentType?: ServiceDefinition['type']
  allowableTypes: AllowedTypes
  preSelectedManifestType?: ManifestTypes
  availableManifestTypes?: ManifestTypes[]
  /* eslint-disable @typescript-eslint/no-explicit-any */
  formik: FormikContextType<any>
  onSubmit: (data: ManifestStepInitData) => void
}
