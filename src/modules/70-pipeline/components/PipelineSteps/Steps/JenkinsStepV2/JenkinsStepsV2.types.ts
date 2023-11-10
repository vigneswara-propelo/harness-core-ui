/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { AllowedTypes, SelectOption, SelectWithSubmenuOption } from '@harness/uicore'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { MutableRefObject } from 'react'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Failure } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { AllFailureStrategyConfig } from '../../AdvancedSteps/FailureStrategyPanel/utils'

export interface SubmenuSelectOption extends SelectOption {
  submenuItems: SelectOption[]
}
export interface jobParameterInterface {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}

export interface JenkinsStepV2Spec {
  connectorRef: string
  consoleLogPollFrequency?: string
  jobName: SelectWithBiLevelOption | string
  childJobName?: SelectWithSubmenuOption | string
  jobParameter: jobParameterInterface[] | string
  delegateSelectors?: string[]
  unstableStatusAsSuccess?: boolean
  useConnectorUrlForJobExecution?: boolean
}

export interface JenkinsStepV2Data {
  identifier: string
  name?: string
  type: string
  timeout?: string
  failureStrategies?: AllFailureStrategyConfig[]
  spec: JenkinsStepV2Spec
}

export interface JenkinsStepV2FormSpec extends Omit<JenkinsStepV2Spec, 'jobName'> {
  jobName: SelectOption
}

export interface JenkinsStepV2FormData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  failureStrategies?: AllFailureStrategyConfig[]
  spec: JenkinsStepV2FormSpec
}

export interface JenkinsStepV2VariableListModeProps {
  variablesData: JenkinsStepV2Data
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JenkinsStepV2DeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JenkinsStepV2Data
  allowableTypes: AllowedTypes
  onUpdate?: (data: JenkinsStepV2Data) => void
  inputSetData?: InputSetData<JenkinsStepV2Data>
  formik?: FormikProps<JenkinsStepV2Data>
}

interface JenkinsStepV2InputVariableModeCustomStepProps {
  variablesData: JenkinsStepV2Data
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JenkinsStepV2InputVariableModeProps {
  initialValues: JenkinsStepV2Data
  onUpdate?: (data: JenkinsStepV2Data) => void
  customStepProps: JenkinsStepV2InputVariableModeCustomStepProps
}

export interface JenkinsStepV2StepModeProps {
  stepViewType: StepViewType
  initialValues: JenkinsStepV2Data
  allowableTypes: AllowedTypes
  onUpdate?: (data: JenkinsStepV2Data) => void
  onChange?: (data: JenkinsStepV2Data) => void
  isNewStep?: boolean
  readonly?: boolean
}

export interface JenkinsV2FormContentInterface {
  formik: FormikProps<JenkinsStepV2Data>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
  showChildJobField: boolean
  setShowChildJobField: (value: boolean) => void
  lastOpenedJob: MutableRefObject<JenkinsStepV2Data>
}
