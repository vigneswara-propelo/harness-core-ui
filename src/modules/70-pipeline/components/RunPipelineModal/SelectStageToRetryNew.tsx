/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, FormEvent } from 'react'
import { isEqual, last } from 'lodash-es'
import { Layout, Select, SelectOption, Text } from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { RetryGroup, RetryInfo } from 'services/pipeline-ng'
import css from './RunPipelineForm.module.scss'

export interface ParallelStageOption extends SelectOption {
  isLastIndex: number
}

export interface SelectStageToRetryState {
  isAllStage: boolean
  listOfSelectedStages: string[]
  selectedStage: ParallelStageOption | null
  isParallelStage: boolean
}

export interface SelectStageToRetryProps {
  preSelectLastStage?: boolean
  /* NOTE: onChange gets called once without user interaction */
  onChange: (value: SelectStageToRetryState) => void
  stageToRetryState: SelectStageToRetryState | null
  retryStagesResponseData?: RetryInfo
  retryStagesLoading: boolean
}

function SelectStageToRetryNew({
  preSelectLastStage,
  onChange,
  stageToRetryState,
  retryStagesResponseData,
  retryStagesLoading
}: SelectStageToRetryProps): React.ReactElement | null {
  const { getString } = useStrings()
  const [stageList, setStageList] = useState<SelectOption[]>([])
  const [isLastIndex, setIsLastIndex] = useState(false)

  const {
    isAllStage = true,
    listOfSelectedStages = [],
    selectedStage = null,
    isParallelStage = false
  } = stageToRetryState ?? {}

  const onChangeInternal = (value: SelectStageToRetryState): void => {
    if (!isEqual(stageToRetryState, value)) {
      onChange(value)
    }
  }

  useEffect(() => {
    if (retryStagesResponseData?.groups?.length) {
      const stageListValues = retryStagesResponseData.groups.map((stageGroup, idx) => {
        if (stageGroup.info?.length === 1) {
          return { label: stageGroup.info[0].name, value: stageGroup.info[0].identifier, isLastIndex: idx }
        } else {
          const parallelStagesLabel = stageGroup.info?.map(stageName => stageName.name).join(' | ')
          const parallelStagesValue = stageGroup.info?.map(stageName => stageName.identifier).join(' | ')
          return {
            label: parallelStagesLabel,
            value: parallelStagesValue,
            isLastIndex: idx
          }
        }
      })
      setStageList(stageListValues as SelectOption[])
    }
  }, [retryStagesResponseData])

  useEffect(() => {
    if (retryStagesResponseData?.groups?.length) {
      const newState: SelectStageToRetryState = {
        isAllStage,
        isParallelStage,
        listOfSelectedStages,
        selectedStage
      }

      if (preSelectLastStage) {
        let value: ParallelStageOption
        const groups = retryStagesResponseData.groups
        const stageGroup = last(groups)
        if (stageGroup) {
          const idx = groups.length - 1
          if (stageGroup?.info?.length === 1) {
            const [{ name, identifier }] = stageGroup?.info || []
            value = { label: name as string, value: identifier as string, isLastIndex: idx }
            const selectedStages = getListOfSelectedStages(value)
            newState.selectedStage = value
            newState.listOfSelectedStages = selectedStages
            onChangeInternal(newState)
          } else {
            const parallelStagesLabel = stageGroup.info?.map(stageName => stageName.name).join(' | ')
            const parallelStagesValue = stageGroup.info?.map(stageName => stageName.identifier).join(' | ')
            value = {
              label: parallelStagesLabel as string,
              value: parallelStagesValue as string,
              isLastIndex: idx
            }
            const lastIndex = getIsLastIndexFromParallelStagesSelection(value)
            setIsLastIndex(lastIndex)
            const selectedStages = getListOfSelectedStages(value)
            newState.selectedStage = value
            newState.listOfSelectedStages = selectedStages
            newState.isParallelStage = true
            newState.isAllStage = true
            onChangeInternal(newState)
          }
        }
      } else {
        onChangeInternal(newState)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryStagesResponseData, preSelectLastStage])

  const getListOfSelectedStages = (value: ParallelStageOption): string[] => {
    const stagesList = retryStagesResponseData?.groups?.filter((_, stageIdx) => stageIdx < value.isLastIndex)
    const listOfIds: string[] = []

    stagesList?.forEach(stageData => {
      stageData?.info?.forEach(stageInfo => {
        listOfIds.push(stageInfo.identifier as string)
      })
    })
    return listOfIds
  }

  const getIsLastIndexFromParallelStagesSelection = (value: ParallelStageOption): boolean => {
    return (value as ParallelStageOption).isLastIndex === (retryStagesResponseData?.groups as RetryGroup[])?.length - 1
  }

  const handleStageChange = (selectedStageValue: ParallelStageOption): void => {
    const newState: SelectStageToRetryState = {
      isAllStage,
      isParallelStage,
      listOfSelectedStages,
      selectedStage: selectedStageValue
    }

    if (selectedStageValue.label.includes('|')) {
      const lastIndex = getIsLastIndexFromParallelStagesSelection(selectedStageValue)
      setIsLastIndex(lastIndex)
      newState.isParallelStage = true
    } else {
      newState.isParallelStage = false
    }

    const selectedStages = getListOfSelectedStages(selectedStageValue)
    newState.listOfSelectedStages = selectedStages

    onChangeInternal(newState)
  }

  const handleStageType = (e: FormEvent<HTMLInputElement>): void => {
    const newState: SelectStageToRetryState = {
      isAllStage: e.currentTarget.value === 'allparallel',
      isParallelStage,
      listOfSelectedStages,
      selectedStage
    }
    onChangeInternal(newState)
  }

  return (
    <div className={css.selectStageWrapper}>
      <Text
        tooltipProps={{ dataTooltipId: 'selectRetryStageText' }}
        color={Color.GREY_700}
        font={{ size: 'small', weight: 'semi-bold' }}
      >
        {retryStagesResponseData?.errorMessage
          ? retryStagesResponseData.errorMessage
          : getString('pipeline.stagetoRetryFrom')}
      </Text>
      {!!retryStagesResponseData?.groups?.length && (
        <Layout.Horizontal
          margin={{ top: 'medium' }}
          spacing="medium"
          flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
          <Select
            disabled={retryStagesLoading}
            name={'selectRetryStage'}
            value={selectedStage}
            items={stageList}
            onChange={value => handleStageChange(value as ParallelStageOption)}
            className={css.selectStage}
          />
          {isParallelStage && isLastIndex && (
            <RadioGroup inline selectedValue={isAllStage ? 'allparallel' : 'failedStages'} onChange={handleStageType}>
              <Radio label={getString('pipeline.runAllParallelstages')} value="allparallel" />
              <Radio label={getString('pipeline.runFailedStages')} value="failedStages" />
            </RadioGroup>
          )}
        </Layout.Horizontal>
      )}
    </div>
  )
}

export default SelectStageToRetryNew
