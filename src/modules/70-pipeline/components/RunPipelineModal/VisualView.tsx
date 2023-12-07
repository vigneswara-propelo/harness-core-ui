/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, FormEvent, SetStateAction, useMemo } from 'react'
import cx from 'classnames'
import type { GetDataError } from 'restful-react'
import { get, isEmpty } from 'lodash-es'
import { FormikForm, Layout, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type {
  Error,
  Failure,
  PipelineInfoConfig,
  ResponseMessage,
  ResponsePMSPipelineResponseDTO,
  RetryInfo
} from 'services/pipeline-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import SelectExistingInputsOrProvideNew from './SelectExistingOrProvide'
import { InputSetSelector } from '../InputSetSelector/InputSetSelector'
import type { InputSetValue } from '../InputSetSelector/utils'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { StepViewType } from '../AbstractSteps/Step'
import type { StageSelectionData } from '../../utils/runPipelineUtils'
import SelectStageToRetryNew, { SelectStageToRetryState } from './SelectStageToRetryNew'
import css from './RunPipelineForm.module.scss'

export type ExistingProvide = 'existing' | 'provide'

export interface VisualViewProps {
  executionView?: boolean
  existingProvide: ExistingProvide
  setExistingProvide: Dispatch<SetStateAction<ExistingProvide>>
  setRunClicked: Dispatch<SetStateAction<boolean>>
  selectedInputSets?: InputSetValue[]
  pipelineIdentifier: string
  executionIdentifier?: string
  hasRuntimeInputs: boolean
  template: PipelineInfoConfig
  templateError?: GetDataError<Failure | Error> | null
  pipeline?: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  resolvedMergedPipeline?: PipelineInfoConfig
  currentPipeline?: {
    pipeline?: PipelineInfoConfig
  }
  getTemplateError: any
  submitForm(): void
  hasInputSets: boolean
  setSelectedInputSets: Dispatch<SetStateAction<InputSetValue[] | undefined>>
  selectedStageData: StageSelectionData
  pipelineResponse: ResponsePMSPipelineResponseDTO | null
  invalidInputSetReferences: string[]
  loadingInputSets: boolean
  onReconcile: (identifier: string) => void
  reRunInputSetYaml?: string
  selectedBranch?: string
  isRetryFromStage?: boolean
  preSelectLastStage?: boolean
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  repoIdentifier?: string
  branch?: string
  connectorRef?: string
  stageToRetryState: SelectStageToRetryState | null
  onStageToRetryChange: (state: SelectStageToRetryState) => void
  retryStagesResponseData?: RetryInfo
  retryStagesLoading: boolean
}

export default function VisualView(props: VisualViewProps): React.ReactElement {
  const {
    executionView,
    existingProvide,
    setExistingProvide,
    selectedInputSets,
    pipelineIdentifier,
    executionIdentifier,
    hasRuntimeInputs,
    template,
    templateError,
    pipeline,
    currentPipeline,
    getTemplateError,
    resolvedMergedPipeline,
    resolvedPipeline,
    setRunClicked,
    submitForm,
    hasInputSets,
    setSelectedInputSets,
    selectedStageData,
    pipelineResponse,
    invalidInputSetReferences,
    loadingInputSets,
    onReconcile,
    reRunInputSetYaml,
    selectedBranch,
    repoIdentifier,
    connectorRef,
    isRetryFromStage,
    preSelectLastStage,
    stageToRetryState,
    onStageToRetryChange,
    retryStagesResponseData,
    retryStagesLoading
  } = props
  const { getString } = useStrings()

  const checkIfRuntimeInputsNotPresent = (): JSX.Element | string | undefined => {
    if (executionView && isEmpty(template)) {
      const templateErrorObj = templateError?.data as Error
      if (!isEmpty(templateErrorObj?.responseMessages)) {
        return <ErrorHandler responseMessages={templateErrorObj?.responseMessages as ResponseMessage[]} />
      }
      return getString('pipeline.inputSets.noRuntimeInputsWhileExecution')
    } else if (!executionView && resolvedMergedPipeline && currentPipeline && !hasRuntimeInputs && !getTemplateError) {
      /*
      We don't have any runtime inputs required for running this pipeline
        - if API doesn't fail and
        - the inputSetTemplateYaml is not present
      */
      return getString('runPipelineForm.noRuntimeInput')
    }
  }

  const showInputSetSelector = (): boolean => {
    return !!(pipeline && currentPipeline && hasRuntimeInputs && existingProvide === 'existing' && hasInputSets)
  }

  const showPipelineInputSetForm = (): boolean => {
    const retryFromStageCondition =
      !isRetryFromStage || (isRetryFromStage && (!!stageToRetryState || !!retryStagesResponseData?.errorMessage))
    return (
      !!(existingProvide === 'provide' || selectedInputSets?.length || executionView) &&
      !loadingInputSets &&
      retryFromStageCondition
    )
  }

  const showVoidPipelineInputSetForm = (): boolean => {
    return !!(existingProvide === 'existing' && selectedInputSets?.length)
  }

  const onExistingProvideRadioChange = (ev: FormEvent<HTMLInputElement>): void => {
    const existingProvideValue = ev.currentTarget.checked ? 'existing' : 'provide'
    setExistingProvide(existingProvideValue)
  }

  const noRuntimeInputs = checkIfRuntimeInputsNotPresent()

  const SelectStageToRetryMemo = useMemo(
    () =>
      isRetryFromStage ? (
        <SelectStageToRetryNew
          preSelectLastStage={preSelectLastStage}
          stageToRetryState={stageToRetryState}
          onChange={onStageToRetryChange}
          retryStagesResponseData={retryStagesResponseData}
          retryStagesLoading={retryStagesLoading}
        />
      ) : null,
    [
      isRetryFromStage,
      preSelectLastStage,
      stageToRetryState,
      onStageToRetryChange,
      retryStagesResponseData,
      retryStagesLoading
    ]
  )

  return (
    <div
      className={cx(executionView ? css.runModalFormContentExecutionView : css.runModalFormContent, {
        [css.noRuntimeInput]: (template as any)?.data?.replacedExpressions?.length > 0 && noRuntimeInputs
      })}
      data-testid="runPipelineVisualView"
      onKeyDown={ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          ev.stopPropagation()
          setRunClicked(true)
          submitForm()
        }
      }}
    >
      <FormikForm>
        {SelectStageToRetryMemo}
        {noRuntimeInputs ? (
          <Layout.Horizontal padding="medium" margin="medium">
            <Text>{noRuntimeInputs}</Text>
          </Layout.Horizontal>
        ) : (
          <>
            {/* Do not show input set selector on rerun / execution input-set view */}
            {!executionView && !reRunInputSetYaml && !isRetryFromStage && (
              <Layout.Vertical
                className={css.pipelineHeader}
                padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
              >
                <SelectExistingInputsOrProvideNew
                  existingProvide={existingProvide}
                  onExistingProvideRadioChange={onExistingProvideRadioChange}
                  hasInputSets={hasInputSets}
                />
                {showInputSetSelector() ? (
                  <GitSyncStoreProvider>
                    <InputSetSelector
                      pipelineIdentifier={pipelineIdentifier}
                      onChange={inputsets => {
                        setSelectedInputSets(inputsets)
                      }}
                      value={selectedInputSets}
                      pipelineGitDetails={get(pipelineResponse, 'data.gitDetails')}
                      invalidInputSetReferences={invalidInputSetReferences}
                      loadingMergeInputSets={loadingInputSets}
                      onReconcile={onReconcile}
                      reRunInputSetYaml={reRunInputSetYaml}
                      selectedBranch={selectedBranch}
                    />
                  </GitSyncStoreProvider>
                ) : null}
              </Layout.Vertical>
            )}
            {showPipelineInputSetForm() ? (
              <PipelineInputSetFormWrapper
                executionView={executionView}
                currentPipeline={currentPipeline}
                executionIdentifier={executionIdentifier}
                hasRuntimeInputs={hasRuntimeInputs}
                template={template}
                resolvedMergedPipeline={resolvedMergedPipeline}
                resolvedPipeline={resolvedPipeline}
                selectedStageData={selectedStageData}
                showDivider={!executionView && !reRunInputSetYaml}
                listOfSelectedStages={isRetryFromStage ? stageToRetryState?.listOfSelectedStages : undefined}
                isRetryFormStageSelected={isRetryFromStage ? stageToRetryState?.selectedStage !== null : undefined}
                branch={selectedBranch}
                repoIdentifier={repoIdentifier}
                connectorRef={connectorRef}
              />
            ) : null}
            {showVoidPipelineInputSetForm() ? <div className={css.noPipelineInputSetForm} /> : null}
          </>
        )}
      </FormikForm>
    </div>
  )
}

export interface PipelineInputSetFormWrapperProps {
  executionView?: boolean
  executionIdentifier?: string
  currentPipeline?: {
    pipeline?: PipelineInfoConfig
  }
  hasRuntimeInputs?: boolean
  template: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  resolvedMergedPipeline?: PipelineInfoConfig
  selectedStageData: StageSelectionData
  maybeContainerClassOverride?: string
  showDivider?: boolean
  listOfSelectedStages?: string[]
  isRetryFormStageSelected?: boolean
  repoIdentifier?: string
  branch?: string
  connectorRef?: string
}

function PipelineInputSetFormWrapper(props: PipelineInputSetFormWrapperProps): React.ReactElement | null {
  const {
    executionView,
    currentPipeline,
    hasRuntimeInputs,
    template,
    executionIdentifier,
    resolvedMergedPipeline,
    resolvedPipeline,
    selectedStageData,
    showDivider,
    listOfSelectedStages,
    isRetryFormStageSelected,
    repoIdentifier,
    branch,
    connectorRef
  } = props

  if (currentPipeline?.pipeline && resolvedMergedPipeline && (hasRuntimeInputs || executionView)) {
    return (
      <>
        {showDivider && (
          <div className={css.dividerWrapper} data-testid={'inputSetFormDivider'}>
            <div className={css.divider} />
          </div>
        )}
        <PipelineInputSetForm
          originalPipeline={resolvedMergedPipeline}
          resolvedPipeline={resolvedPipeline}
          template={template}
          readonly={executionView}
          path=""
          viewType={StepViewType.DeploymentForm}
          isRunPipelineForm
          executionIdentifier={executionIdentifier}
          maybeContainerClass={css.inputSetFormRunPipeline}
          selectedStageData={selectedStageData}
          disableRuntimeInputConfigureOptions
          listOfSelectedStages={listOfSelectedStages}
          isRetryFormStageSelected={isRetryFormStageSelected}
          branch={branch}
          repoName={repoIdentifier}
          connectorRef={connectorRef}
        />
      </>
    )
  }

  return null
}
