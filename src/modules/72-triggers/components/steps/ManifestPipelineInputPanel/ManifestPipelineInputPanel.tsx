/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
  PageSpinner
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { merge, cloneDeep, isEmpty, defaultTo, get, debounce, remove } from 'lodash-es'
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
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { InputSetValue } from '@pipeline/components/InputSetSelector/utils'
import { clearRuntimeInput, mergeTemplateWithInputSetData } from '@pipeline/utils/runPipelineUtils'
import { memoizedParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO, Pipeline } from '@pipeline/utils/types'
import NewInputSetModal from '@pipeline/components/InputSetForm/NewInputSetModal'
import {
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest,
  TriggerTypes,
  getTriggerInputSetsBranchQueryParameter,
  getErrorMessage,
  TriggerGitEventTypes,
  TriggerGitEvent,
  ciCodebaseBuildIssueComment
} from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import useIsNewGitSyncRemotePipeline from '@triggers/components/Triggers/useIsNewGitSyncRemotePipeline'
import { getPipelineWithInjectedWithCloneCodebase } from '@triggers/components/Triggers/WebhookTrigger/utils'
import {
  PipelineVariablesContextProvider,
  usePipelineVariables
} from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import css from '@triggers/pages/triggers/views/WebhookPipelineInputPanel.module.scss'

interface ManifestTriggerInputPanelFormProps {
  formikProps?: any
  isEdit?: boolean
}

function ManifestTriggerInputPanelForm({
  formikProps,
  isEdit
}: ManifestTriggerInputPanelFormProps): React.ReactElement {
  const {
    values: { inputSetSelected, pipeline, resolvedPipeline },
    values
  } = formikProps

  const isNewGitSyncRemotePipeline = useIsNewGitSyncRemotePipeline()

  const { getString } = useStrings()
  const ciCodebaseBuildValue = formikProps.values?.pipeline?.properties?.ci?.codebase?.build
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [hasEverRendered, setHasEverRendered] = useState(
    typeof ciCodebaseBuildValue === 'object' && !isEmpty(ciCodebaseBuildValue)
  )
  const [mergingInputSets, setMergingInputSets] = useState<boolean>(false)
  const [invalidInputSetIds, setInvalidInputSetIds] = useState<Array<string>>([])
  const { setPipeline: updatePipelineInVariablesContext } = usePipelineVariables()

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
    triggerIdentifier: string
  }>()

  const { data: template, loading } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      // GitX related query params
      branch,
      repoName,
      repoIdentifier,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    body: {
      stageIdentifiers: formikProps.values?.stagesToExecute ?? []
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })
  const inputSetSelectedBranch = useMemo(() => {
    return getTriggerInputSetsBranchQueryParameter({
      gitAwareForTriggerEnabled: isNewGitSyncRemotePipeline,
      pipelineBranchName: formikProps?.values?.pipelineBranchName,
      branch
    })
  }, [isNewGitSyncRemotePipeline, branch, formikProps?.values?.pipelineBranchName])

  const onReconcile = (inpSetId: string): void => {
    remove(invalidInputSetIds, id => id === inpSetId)
    setInvalidInputSetIds(invalidInputSetIds)
  }

  const { mutate: mergeInputSet, error: mergeInputSetError } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      branch: isNewGitSyncRemotePipeline ? inputSetSelectedBranch : branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  useEffect(() => {
    const shouldInjectCloneCodebase = isCloneCodebaseEnabledAtLeastOneStage(resolvedPipeline)

    if (
      !isNewGitSyncRemotePipeline &&
      !hasEverRendered &&
      shouldInjectCloneCodebase &&
      !isEdit &&
      formikProps?.values?.triggerType !== TriggerTypes.SCHEDULE
    ) {
      const formikValues = cloneDeep(formikProps.values)
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
        shouldUseDefaultValues: triggerIdentifier === 'new'
      })
      formikProps.setValues({
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

  const inputSetQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      connectorRef,
      repoName,
      storeType,
      branch: getTriggerInputSetsBranchQueryParameter({
        gitAwareForTriggerEnabled: isNewGitSyncRemotePipeline,
        pipelineBranchName: formikProps?.values?.pipelineBranchName,
        branch
      })
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      formikProps?.values?.pipelineBranchName,
      connectorRef,
      repoName,
      storeType,
      branch,
      isNewGitSyncRemotePipeline
    ]
  )

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

        const inputSetRefs = formikProps?.values?.inputSetRefs
        const inputSetRefsLength = formikProps?.values?.inputSetRefs?.length
        const selectedInputSetsLength = selectedInputSets?.length

        if (
          inputSetRefsLength &&
          selectedInputSetsLength &&
          inputSetRefsLength === selectedInputSetsLength &&
          inputSetRefs?.every((ref: string) => selectedInputSets?.find(item => item.value === ref))
        ) {
          // No need to fetch input sets if they are fetched already
          return
        }

        Promise.all(
          inputSetRefs.map(async (inputSetIdentifier: string): Promise<any> => {
            const data = await getInputSetForPipelinePromise({
              inputSetIdentifier,
              queryParams: inputSetQueryParams
            })

            return data
          })
        )
          .then(results => {
            const error = (results || []).find(result => get(result, 'status') === 'ERROR')
            if (error) {
              if (!inputSetSelected) {
                formikProps.setValues({
                  ...formikProps.values,
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

      if (!fetchInputSetsInProgress && !inputSetSelected && formikProps?.values?.inputSetRefs?.length) {
        setFetchInputSetsInProgress(true)
        fetchInputSets()
      }
    },
    [
      formikProps?.values?.inputSetRefs,
      inputSetSelected,
      inputSetQueryParams,
      fetchInputSetsInProgress,
      selectedInputSets,
      formikProps
    ]
  )

  useEffect(() => {
    if (template?.data?.inputSetTemplateYaml && selectedInputSets && selectedInputSets.length > 0) {
      const pipelineObject = memoizedParse<Pipeline>(template?.data?.inputSetTemplateYaml)
      const fetchData = async (): Promise<void> => {
        const data = await mergeInputSet({
          inputSetReferences: selectedInputSets.map(item => item.value as string)
        })
        if (!data?.data?.errorResponse && data?.data?.pipelineYaml) {
          const parsedInputSets = memoizedParse<Pipeline>(data.data.pipelineYaml).pipeline

          const newPipelineObject = clearRuntimeInput(merge(resolvedPipeline, pipelineObject.pipeline))

          const mergedPipeline = mergeTemplateWithInputSetData({
            inputSetPortion: { pipeline: parsedInputSets },
            templatePipeline: { pipeline: newPipelineObject },
            allValues: { pipeline: resolvedPipeline },
            shouldUseDefaultValues: triggerIdentifier === 'new'
          })

          formikProps.setValues({
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
        fetchData()
          .then(() => setMergingInputSets(false))
          .catch(() => setMergingInputSets(false))
      } catch (e) {
        setMergingInputSets(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets?.length,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    resolvedPipeline
  ])
  const pipelineReferenceBranchPlaceHolder = useMemo(() => {
    if (formikProps?.values?.triggerType === TriggerTypes.WEBHOOK) {
      return ciCodebaseBuild.spec.branch
    }
    return getString('common.branchName')
  }, [formikProps?.values?.triggerType, formikProps?.values?.event, getString])

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
    const event = formikProps?.values?.event
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

      formikProps.setValues({
        ...formikProps.values,
        inputSetSelected: _inputSetSelected,
        inputSetRefs: _inputSetSelected.map(_inputSet => _inputSet.value)
      })
    },
    [formikProps, selectedInputSets]
  )

  useEffect(() => {
    setInputSetError(formikProps?.errors?.inputSetRefs)
  }, [setInputSetError, formikProps?.errors?.inputSetRefs])

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
      {loading && !isPipelineBranchNameInFocus() ? (
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
                      formikProps.setValues({
                        ...formikProps.values,
                        inputSetRefs: (value || []).map(v => v.value),
                        inputSetSelected: value
                      })
                    }}
                    value={selectedInputSets}
                    selectedValueClass={css.inputSetSelectedValue}
                    selectedRepo={isNewGitSyncRemotePipeline ? repoName : repoIdentifier}
                    selectedBranch={inputSetSelectedBranch}
                    showNewInputSet={isNewGitSyncRemotePipeline}
                    onNewInputSetClick={() => setShowNewInputSetModal(true)}
                    invalidInputSetReferences={invalidInputSetIds}
                    loadingMergeInputSets={mergingInputSets}
                    onReconcile={onReconcile}
                  />
                </GitSyncStoreProvider>
                {inputSetError && <Text intent="danger">{inputSetError}</Text>}
                <div className={css.divider} />
                {showNewInputSetModal && (
                  <NewInputSetModal
                    inputSetInitialValue={inputSetInitialValue}
                    isModalOpen={showNewInputSetModal}
                    closeModal={() => setShowNewInputSetModal(false)}
                    onCreateSuccess={onNewInputSetSuccess}
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
            {showPipelineInputSetForm &&
              template?.data?.inputSetTemplateYaml &&
              !mergingInputSets &&
              isEmpty(invalidInputSetIds) && (
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

const ManifestPipelineInputPanel: React.FC<ManifestTriggerInputPanelFormProps> = props => {
  const {
    state: { storeMetadata }
  } = usePipelineContext()

  return (
    <NestedAccordionProvider>
      <PipelineVariablesContextProvider enablePipelineTemplatesResolution={true} storeMetadata={storeMetadata}>
        <ManifestTriggerInputPanelForm {...props} />
      </PipelineVariablesContextProvider>
    </NestedAccordionProvider>
  )
}
export default ManifestPipelineInputPanel
