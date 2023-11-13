/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { clone, defaultTo, get, isString, set } from 'lodash-es'
import {
  HarnessDocTooltip,
  Layout,
  MultiTypeInput,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text,
  getMultiTypeFromValue
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import produce from 'immer'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import { useStrings } from 'framework/strings'
import { ArtifactListConfig, ArtifactSource } from 'services/cd-ng'
import {
  isMultiTypeExpression,
  isMultiTypeRuntime,
  isValueRuntimeInput,
  isValueExpression
} from '@modules/10-common/utils/utils'
import { useVariablesExpression } from '@modules/70-pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './PrimaryArtifactSelectionDropDown.module.scss'

export interface PrimaryArtifactSelectionDropdownProps {
  isPropagating: boolean
}

const getArtifactsSelectOptions = (artifactSources: ArtifactSource[]): SelectOption[] => {
  const items: SelectOption[] | undefined = artifactSources.map(item => {
    return { value: item.identifier, label: item.name || item.identifier }
  })
  return defaultTo(items, [])
}

export const PrimaryArtifactSelectionDropDown = (props: PrimaryArtifactSelectionDropdownProps): React.ReactElement => {
  const { isPropagating } = props
  const { getString } = useStrings()
  const {
    state: {
      selectionState: { selectedStageId }
    },
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const { expressions } = useVariablesExpression()

  const artifacts = useMemo((): ArtifactListConfig => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
  }, [isPropagating, stage])

  const artifactSelectOptions = getArtifactsSelectOptions(defaultTo(artifacts.primary?.sources, []))

  const [multiType, setMultiType] = React.useState<MultiTypeInputType>(
    getMultiTypeFromValue(get(artifacts.primary, 'primaryArtifactRef'))
  )

  const getPrimaryArtifactRefFromDropDown = (
    primaryArtifactRef: SelectOption | string | undefined
  ): string | SelectOption => {
    if (isValueRuntimeInput(primaryArtifactRef)) {
      return RUNTIME_INPUT_VALUE
    } else if (isMultiTypeExpression(multiType) || isValueExpression(primaryArtifactRef)) {
      return defaultTo(primaryArtifactRef, '')
    } else if (isString(primaryArtifactRef)) {
      return { label: primaryArtifactRef, value: primaryArtifactRef }
    } else if (primaryArtifactRef) {
      return primaryArtifactRef
    } else {
      return { label: '', value: '' }
    }
  }

  const updatePrimaryArtifact = (value: string): void => {
    const newArtifacts = clone(artifacts)
    set(defaultTo(newArtifacts.primary, {}), 'primaryArtifactRef', value)

    if (stage) {
      const newStage = produce(stage, draft => {
        set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', newArtifacts)
      }).stage
      if (newStage) {
        updateStage(newStage)
      }
    }
  }

  const onTypeChange = (type: MultiTypeInputType): void => {
    const value = isMultiTypeRuntime(type) ? RUNTIME_INPUT_VALUE : ''
    updatePrimaryArtifact(value)
    setMultiType(type)
  }
  const setPrimaryArtifactRef = (primaryArtifactRef: string | SelectOption | undefined): void => {
    let value
    if (isValueRuntimeInput(primaryArtifactRef)) {
      value = RUNTIME_INPUT_VALUE
    } else if (isMultiTypeExpression(multiType) || isValueExpression(primaryArtifactRef)) {
      value = defaultTo(primaryArtifactRef, '')
    } else if (isString(primaryArtifactRef)) {
      value = primaryArtifactRef
    } else {
      value = defaultTo(primaryArtifactRef?.value, '')
    }

    updatePrimaryArtifact(value as string)
  }

  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center' }}
      data-tooltip-id={'primary-artifact-selection-dropdown'}
      className={css.multiTypeSelect}
    >
      <Text font={{ variation: FontVariation.BODY2 }} margin={{ right: 'small' }} color={Color.GREY_800}>
        {getString('primary')}
        <HarnessDocTooltip tooltipId={'primary-artifact-selection-dropdown'} useStandAlone={true} />
      </Text>
      <MultiTypeInput
        name="primary"
        selectProps={{
          addClearBtn: true,
          items: artifactSelectOptions
        }}
        value={getPrimaryArtifactRefFromDropDown(get(artifacts['primary'], 'primaryArtifactRef'))}
        width={300}
        defaultValueToReset={''}
        onChange={item => setPrimaryArtifactRef(item as string | SelectOption)}
        expressions={expressions}
        onTypeChange={onTypeChange}
      />
    </Layout.Horizontal>
  )
}
