/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export const FIELD_KEYS = {
  application: 'spec.applicationNameOption',
  targetRevision: 'spec.targetRevision',
  fileParameters: 'spec.helm.fileParameters',
  parameters: 'spec.helm.parameters',
  valueFiles: 'spec.helm.valueFiles'
}

export interface Variable {
  path?: string
  value?: string
  id?: string
  name?: string
}
export const SOURCE_TYPE_UNSET = 'UNSET'

export interface ApplicationOption extends SelectOption {
  repoIdentifier?: string
  agentId?: string
  sourceType?: string
  chart?: string
  targetRevision?: string
}

export interface UpdateGitOpsAppStepData extends StepElementConfig {
  spec: {
    applicationNameOption?: ApplicationOption | string
    applicationName?: string
    agentId?: string
    targetRevision?: string
    helm?: {
      fileParameters?: Variable[]
      parameters?: Variable[]
      valueFiles?: SelectOption[] | string[]
    }
  }
}

export interface UpdateGitOpsAppProps {
  initialValues: UpdateGitOpsAppStepData
  onUpdate?: (data: UpdateGitOpsAppStepData) => void
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  inputSetData?: {
    template?: UpdateGitOpsAppStepData
    path?: string
    readonly?: boolean
  }
  onChange?: (data: UpdateGitOpsAppStepData) => void
  readonly?: boolean
}
