/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface RevertPRStepData extends StepElementConfig {
  spec: {
    commitId: string
    prTitle?: string
  }
}

export interface GitOpsRevertPRProps {
  initialValues: RevertPRStepData
  onUpdate?: (data: RevertPRStepData) => void
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  inputSetData?: {
    template?: RevertPRStepData
    path?: string
    readonly?: boolean
  }
  onChange?: (data: RevertPRStepData) => void
  readonly?: boolean
}
