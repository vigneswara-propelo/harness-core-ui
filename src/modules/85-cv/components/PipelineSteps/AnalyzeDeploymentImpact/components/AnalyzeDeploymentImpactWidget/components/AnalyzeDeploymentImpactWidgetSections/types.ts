/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { AnalyzeDeploymentImpactData } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'

export interface AnalyzeDeploymentImpactWidgetSectionsProps {
  isNewStep?: boolean
  formik: FormikProps<AnalyzeDeploymentImpactData>
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}
