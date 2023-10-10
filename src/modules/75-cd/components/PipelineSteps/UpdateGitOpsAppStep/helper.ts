/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import { MultiTypeInputType } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { RepositoriesRefs } from 'services/gitops'

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
  path?: string
}

export interface UpdateGitOpsAppStepData extends StepElementConfig {
  spec: {
    applicationNameOption?: ApplicationOption | string
    applicationName?: string
    agentId?: string
    targetRevision?: SelectOption | string
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

export const SOURCE_TYPES = {
  Helm: 'Helm',
  Git: 'Git'
}

export const isHelmApp = (app?: ApplicationOption) => app?.sourceType === SOURCE_TYPES.Helm

export const gitopsAllowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] as AllowedTypes

export const getRevisionsTransformedArr = (
  revisions: RepositoriesRefs | null
): { revisionsBranchesArr: SelectOption[]; revisionsTagsArr: SelectOption[] } => {
  const revisionsBranchesArr: SelectOption[] = defaultTo(
    revisions?.branches?.map(branch => {
      return {
        label: defaultTo(branch, ''),
        value: defaultTo(branch, '')
      }
    }),
    []
  )

  const revisionsTagsArr: SelectOption[] = defaultTo(
    revisions?.tags?.map(tag => {
      return {
        label: defaultTo(tag, ''),
        value: defaultTo(tag, '')
      }
    }),
    []
  )
  return { revisionsBranchesArr, revisionsTagsArr }
}

export enum RevisionType {
  Branch = 'Branch',
  Tags = 'Tags'
}
