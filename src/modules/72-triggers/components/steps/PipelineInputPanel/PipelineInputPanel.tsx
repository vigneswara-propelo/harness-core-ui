/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  Container,
  FormInput,
  Layout,
  Text,
  NestedAccordionProvider,
  HarnessDocTooltip,
  PageSpinner,
  Icon
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep, isEmpty, defaultTo, get, debounce, remove } from 'lodash-es'
import { FormikProps } from 'formik'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import {
  PipelineInfoConfig,
  useGetTemplateFromPipeline,
  getInputSetForPipelinePromise,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  InputSetResponse,
  ResponseInputSetResponse
} from 'services/pipeline-ng'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { isCloneCodebaseEnabledAtLeastOneStage } from '@pipeline/utils/CIUtils'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useDeepCompareEffect, useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams, TriggerPathProps } from '@common/interfaces/RouteInterfaces'
import type { InputSetValue } from '@pipeline/components/InputSetSelector/utils'
import { mergeTemplateWithInputSetData } from '@pipeline/utils/runPipelineUtils'
import { memoizedParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO, Pipeline } from '@pipeline/utils/types'
import NewInputSetModal from '@pipeline/components/InputSetForm/NewInputSetModal'
import {
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest,
  getTriggerInputSetsBranchQueryParameter,
  getErrorMessage,
  TriggerGitEventTypes,
  TriggerGitEvent,
  ciCodebaseBuildIssueComment,
  isNewTrigger
} from '@triggers/components/Triggers/utils'
import { getPipelineWithInjectedWithCloneCodebase } from '@triggers/components/Triggers/WebhookTrigger/utils'
import useIsNewGitSyncRemotePipeline from '@triggers/components/Triggers/useIsNewGitSyncRemotePipeline'
import {
  PipelineVariablesContextProvider,
  usePipelineVariables
} from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { TriggerTypes } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import css from './PipelineInputPanel.module.scss'

interface PipelineInputPanelPropsInterface {
  formikProps?: FormikProps<any>
  isEdit?: boolean
}

function PipelineInputPanelForm({ formikProps, isEdit }: PipelineInputPanelPropsInterface): React.ReactElement {
  const {
    values: { inputSetSelected, pipeline, resolvedPipeline, triggerType },
    values
  } = formikProps ?? { values: {} }

  const isNewGitSyncRemotePipeline = useIsNewGitSyncRemotePipeline()

  const { getString } = useStrings()
  const ciCodebaseBuildValue = values?.pipeline?.properties?.ci?.codebase?.build
  const { repoIdentifier, branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [hasEverRendered, setHasEverRendered] = useState(
    typeof ciCodebaseBuildValue === 'object' && !isEmpty(ciCodebaseBuildValue)
  )
  const [mergingInputSets, setMergingInputSets] = useState<boolean>(false)
  const [invalidInputSetIds, setInvalidInputSetIds] = useState<Array<string>>([])
  const { setPipeline: updatePipelineInVariablesContext } = usePipelineVariables()

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier } =
    useParams<TriggerPathProps>()

  const inputSetSelectedBranch = useMemo(() => {
    return getTriggerInputSetsBranchQueryParameter({
      gitAwareForTriggerEnabled: isNewGitSyncRemotePipeline,
      pipelineBranchName: values?.pipelineBranchName,
      branch
    })
  }, [isNewGitSyncRemotePipeline, branch, values?.pipelineBranchName])

  const commonQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      // GitX related query params
      branch: inputSetSelectedBranch,
      repoName,
      repoIdentifier,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    }),
    [
      accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      connectorRef,
      repoName,
      inputSetSelectedBranch
    ]
  )

  const { data: template, loading } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: commonQueryParams,
    body: {
      stageIdentifiers: formikProps?.values?.stagesToExecute ?? []
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    ...(isNewGitSyncRemotePipeline && { debounce: 300 })
  })

  const onReconcile = (inpSetId: string): void => {
    remove(invalidInputSetIds, id => id === inpSetId)
    setInvalidInputSetIds(invalidInputSetIds)
  }

  const { mutate: mergeInputSet, error: mergeInputSetError } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: commonQueryParams,
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  useEffect(() => {
    const shouldInjectCloneCodebase = isCloneCodebaseEnabledAtLeastOneStage(resolvedPipeline)

    if (!isNewGitSyncRemotePipeline && !hasEverRendered && shouldInjectCloneCodebase && !isEdit) {
      const formikValues = cloneDeep(values)
      const isPipelineFromTemplate = !!formikValues?.pipeline?.template
      const newPipelineObject = getPipelineWithInjectedWithCloneCodebase({
        event: formikValues.event,
        pipeline: formikValues.pipeline,
        isPipelineFromTemplate
      })

      const mergedPipeline = mergeTemplateWithInputSetData({
        inputSetPortion: { pipeline: newPipelineObject },
        templatePipeline: { pipeline: newPipelineObject },
        allValues: { pipeline: resolvedPipeline },
        shouldUseDefaultValues: isNewTrigger(triggerIdentifier)
      })
      formikProps?.setValues({
        ...formikValues,
        pipeline: mergedPipeline.pipeline
      })
    }

    setHasEverRendered(true)
  }, [
    formikProps,
    hasEverRendered,
    resolvedPipeline?.properties?.ci?.codebase,
    resolvedPipeline?.stages,
    resolvedPipeline,
    triggerIdentifier,
    isEdit,
    isNewGitSyncRemotePipeline
  ])

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  const [fetchInputSetsInProgress, setFetchInputSetsInProgress] = useState(false)
  const [inputSetError, setInputSetError] = useState('')

  useEffect(() => {
    setInputSetError(getErrorMessage(mergeInputSetError) || '')
  }, [mergeInputSetError])

  useEffect(
    function fetchInputSetsFromInputSetRefs() {
      async function fetchInputSets(): Promise<void> {
        setInputSetError('')

        const inputSetRefs = values?.inputSetRefs
        const inputSetRefsLength = values?.inputSetRefs?.length
        const selectedInputSetsLength = selectedInputSets?.length

        if (
          inputSetRefsLength &&
          selectedInputSetsLength &&
          inputSetRefsLength === selectedInputSetsLength &&
          inputSetRefs?.every((ref: string) => selectedInputSets?.find(item => item.value === ref))
        ) {
          setFetchInputSetsInProgress(false)
          // No need to fetch input sets if they are fetched already
          return
        }

        Promise.all(
          inputSetRefs.map(async (inputSetIdentifier: string): Promise<any> => {
            const data = await getInputSetForPipelinePromise({
              inputSetIdentifier,
              queryParams: commonQueryParams
            })

            return data
          })
        )
          .then(results => {
            const error = (results || []).find(result => get(result, 'status') === 'ERROR')
            if (error) {
              if (!inputSetSelected) {
                formikProps?.setValues({
                  ...values,
                  inputSetSelected: []
                })
              }
              setInputSetError(getErrorMessage(error))
            } else if (results?.length) {
              const inputSets = (results as unknown as { data: InputSetResponse }[]).map(
                ({ data: { identifier, name, gitDetails } }) => ({
                  label: name,
                  value: identifier,
                  type: 'INPUT_SET',
                  gitDetails
                })
              )

              setSelectedInputSets(inputSets as InputSetValue[])
            }
          })
          .catch(exception => {
            setInputSetError(getErrorMessage(exception))
          })
          .finally(() => {
            setFetchInputSetsInProgress(false)
          })
      }

      if (!fetchInputSetsInProgress && !inputSetSelected && values?.inputSetRefs?.length) {
        setFetchInputSetsInProgress(true)
        fetchInputSets()
      }
    },
    [
      values?.inputSetRefs,
      inputSetSelected,
      commonQueryParams,
      fetchInputSetsInProgress,
      selectedInputSets,
      formikProps
    ]
  )

  useDeepCompareEffect(() => {
    if (template?.data?.inputSetTemplateYaml && selectedInputSets && selectedInputSets.length > 0) {
      const inputSetTemplate = memoizedParse<Pipeline>(template?.data?.inputSetTemplateYaml)
      const fetchData = async (): Promise<void> => {
        const data = await mergeInputSet({
          inputSetReferences: selectedInputSets.map(item => item.value as string)
        })
        if (data?.data?.pipelineYaml) {
          const parsedInputSets = memoizedParse<Pipeline>(data.data.pipelineYaml).pipeline

          const mergedPipeline = mergeTemplateWithInputSetData({
            inputSetPortion: { pipeline: parsedInputSets },
            templatePipeline: { pipeline: inputSetTemplate.pipeline },
            allValues: { pipeline: resolvedPipeline },
            shouldUseDefaultValues: triggerIdentifier === 'new'
          })

          formikProps?.setValues({
            ...values,
            inputSetSelected: selectedInputSets,
            pipeline: mergedPipeline.pipeline
          })
        } else if (data?.data?.errorResponse) {
          setSelectedInputSets([])
        }
        setInvalidInputSetIds(get(data?.data, 'inputSetErrorWrapper.invalidInputSetReferences', []))
      }
      setMergingInputSets(true)
      try {
        fetchData().finally(() => {
          setMergingInputSets(false)
        })
      } catch (e) {
        setMergingInputSets(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    resolvedPipeline
  ])

  const pipelineReferenceBranchPlaceHolder = useMemo(() => {
    if (triggerType === TriggerTypes.WEBHOOK) {
      return ciCodebaseBuild.spec.branch
    }
    return getString('common.branchName')
  }, [triggerType, getString])

  const showPipelineInputSetSelector = useMemo(
    () => !isEmpty(pipeline) && !!template?.data?.inputSetTemplateYaml,
    [pipeline, template?.data?.inputSetTemplateYaml]
  )

  const showPipelineInputSetForm = useMemo(() => {
    // With GitX enabled, only show when at least one input set is selected
    if (isNewGitSyncRemotePipeline) {
      return showPipelineInputSetSelector && !!selectedInputSets?.length
    }

    return showPipelineInputSetSelector
  }, [showPipelineInputSetSelector, isNewGitSyncRemotePipeline, selectedInputSets])

  // When Pipeline Reference Branch is changed (by typing new value), re-merge Input Sets
  const reevaluateInputSetMerge = useCallback(
    debounce(() => {
      if (selectedInputSets?.length) {
        setSelectedInputSets([].concat(selectedInputSets as []))
      }
    }, 1000),
    [selectedInputSets]
  )
  const [showNewInputSetModal, setShowNewInputSetModal] = useState(false)
  const inputSetInitialValue = useMemo(() => {
    const event = values?.event
    return TriggerGitEventTypes.includes(event) && !!pipeline?.properties?.ci?.codebase
      ? ({
          pipeline: {
            properties: {
              ci: {
                codebase: {
                  build: {
                    ...(event === TriggerGitEvent.PUSH ? ciCodebaseBuild : undefined),
                    ...(event === TriggerGitEvent.ISSUE_COMMENT ? ciCodebaseBuildIssueComment : undefined),
                    ...(event === TriggerGitEvent.PULL_REQUEST ? ciCodebaseBuildPullRequest : undefined)
                  }
                }
              }
            }
          }
        } as unknown as InputSetDTO)
      : undefined
  }, [formikProps, pipeline?.properties?.ci?.codebase])
  const onNewInputSetSuccess = useCallback(
    (response: ResponseInputSetResponse) => {
      const inputSet = response.data as InputSetResponse
      const _inputSetSelected = (selectedInputSets || []).concat({
        label: inputSet.name as string,
        value: inputSet.identifier as string,
        type: 'INPUT_SET',
        gitDetails: inputSet.gitDetails
      })

      setInputSetError('')
      setSelectedInputSets(_inputSetSelected)

      formikProps?.setValues({
        ...values,
        inputSetSelected: _inputSetSelected,
        inputSetRefs: _inputSetSelected.map(_inputSet => _inputSet.value)
      })
    },
    [formikProps, selectedInputSets]
  )

  const closeModal = useCallback(() => {
    setShowNewInputSetModal(false)
  }, [])

  useEffect(() => {
    setInputSetError(formikProps?.errors?.inputSetRefs as string)
  }, [formikProps?.errors?.inputSetRefs])

  useDeepCompareEffect(() => {
    if (resolvedPipeline) {
      updatePipelineInVariablesContext(resolvedPipeline)
    }
  }, [resolvedPipeline])

  // Don't show spinner when fetching is triggered by typing from
  // Pipeline Reference. Giving users a better experience
  const isPipelineBranchNameInFocus = (): boolean =>
    !!isNewGitSyncRemotePipeline &&
    !!document.activeElement &&
    document.activeElement === document.querySelector('input[name="pipelineBranchName"]')

  return (
    <Layout.Vertical className={css.webhookPipelineInputContainer} spacing="large" padding="none">
      <Layout.Horizontal className={css.infoBar}>
        <Icon name="info-message" size={14} color={Color.GREEN_500} />
        <Text color={Color.WHITE}>
          <Text color={Color.WHITE}>{getString('triggers.toast.payloadInfoBar')}</Text>
          <a
            href={'https://developer.harness.io/docs/platform/pipelines/w_pipeline-steps-reference/triggers-reference/'}
            style={{ color: Color.WHITE }}
          >
            {getString('learnMore')}
          </a>
        </Text>
      </Layout.Horizontal>
      {(loading || fetchInputSetsInProgress || mergingInputSets) && !isPipelineBranchNameInFocus() ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : template?.data?.inputSetTemplateYaml || isNewGitSyncRemotePipeline ? (
        <div className={css.inputsetGrid}>
          <div className={css.inputSetContent}>
            {showPipelineInputSetSelector && (
              <div className={css.pipelineInputRow}>
                <Text className={css.formContentTitle} inline={true} data-tooltip-id="pipelineInputLabel">
                  {getString('triggers.pipelineInputLabel')}
                  <HarnessDocTooltip tooltipId="pipelineInputLabel" useStandAlone={true} />
                </Text>
                <GitSyncStoreProvider>
                  <InputSetSelector
                    pipelineIdentifier={pipelineIdentifier}
                    onChange={value => {
                      setInputSetError('')
                      setSelectedInputSets(value)
                      formikProps?.setValues({
                        ...values,
                        inputSetRefs: (value || []).map(v => v.value),
                        inputSetSelected: value
                      })
                    }}
                    value={selectedInputSets}
                    selectedValueClass={css.inputSetSelectedValue}
                    selectedRepo={isNewGitSyncRemotePipeline ? repoName : repoIdentifier}
                    selectedBranch={inputSetSelectedBranch}
                    showNewInputSet={true}
                    onNewInputSetClick={() => setShowNewInputSetModal(true)}
                    invalidInputSetReferences={invalidInputSetIds}
                    loadingMergeInputSets={mergingInputSets}
                    onReconcile={onReconcile}
                    closeInputSetModalOnApply
                  />
                </GitSyncStoreProvider>
                {inputSetError ? <Text intent="danger">{inputSetError}</Text> : null}
                <div className={css.divider} />
                {showNewInputSetModal && (
                  <NewInputSetModal
                    inputSetInitialValue={inputSetInitialValue}
                    isModalOpen={showNewInputSetModal}
                    closeModal={closeModal}
                    onCreateUpdateSuccess={onNewInputSetSuccess}
                  />
                )}
              </div>
            )}
            {isNewGitSyncRemotePipeline && (
              <Container padding={{ top: 'medium' }}>
                <Text
                  color={Color.BLACK_100}
                  font={{ weight: 'semi-bold' }}
                  inline={true}
                  data-tooltip-id="pipelineReferenceBranch"
                >
                  {getString('triggers.pipelineReferenceBranch')}
                  <HarnessDocTooltip tooltipId="pipelineReferenceBranch" useStandAlone={true} />
                </Text>
                <Container className={cx(css.refBranchOuter, css.halfWidth)}>
                  <FormInput.Text
                    name="pipelineBranchName"
                    placeholder={pipelineReferenceBranchPlaceHolder}
                    inputGroup={{
                      onInput: reevaluateInputSetMerge
                    }}
                  />
                </Container>
                <div className={css.divider} />
              </Container>
            )}
            {showPipelineInputSetForm && template?.data?.inputSetTemplateYaml && (
              <PipelineInputSetForm
                originalPipeline={resolvedPipeline}
                template={defaultTo(
                  memoizedParse<Pipeline>(template?.data?.inputSetTemplateYaml)?.pipeline,
                  {} as PipelineInfoConfig
                )}
                path="pipeline"
                viewType={StepViewType.InputSet}
                maybeContainerClass={css.pipelineInputSetForm}
                viewTypeMetadata={{ isTrigger: true }}
                readonly={isNewGitSyncRemotePipeline || !isEmpty(selectedInputSets)}
                gitAwareForTriggerEnabled={isNewGitSyncRemotePipeline}
                disableRuntimeInputConfigureOptions
                stageTooltip={{ [StageType.BUILD]: 'pipelineInputStage' }}
              />
            )}
          </div>
        </div>
      ) : (
        <Layout.Vertical padding={{ left: 'small', right: 'small' }} margin="large" spacing="large">
          <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'pipelineInputLabel' }}>
            {getString('triggers.pipelineInputLabel')}
          </Text>
          <Layout.Vertical className={css.formContent}>
            <Text>{getString('pipeline.pipelineInputPanel.noRuntimeInputs')}</Text>
          </Layout.Vertical>
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}

const PipelineInputPanel: React.FC<PipelineInputPanelPropsInterface> = props => {
  const {
    state: { storeMetadata }
  } = usePipelineContext()

  return (
    <NestedAccordionProvider>
      <PipelineVariablesContextProvider enablePipelineTemplatesResolution={true} storeMetadata={storeMetadata}>
        <PipelineInputPanelForm {...props} />
      </PipelineVariablesContextProvider>
    </NestedAccordionProvider>
  )
}
export default PipelineInputPanel
