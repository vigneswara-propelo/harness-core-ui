/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import produce from 'immer'
import { ModalDialog, useToaster } from '@harness/uicore'
import { defaultTo, isEmpty, omit } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { ShowModal, useModalHook } from '@harness/use-modal'
import { parse } from '@common/utils/YamlHelperMethods'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { getDefaultStoreType, getSettingValue } from '@platform/default-settings/utils/utils'
import { EntityGitDetails, StepElementConfig, useGetSettingsList } from 'services/cd-ng'
import {
  GitQueryParams,
  PipelinePathProps,
  PipelineType,
  RunPipelineQueryParams
} from '@common/interfaces/RouteInterfaces'
import { SettingType } from '@common/constants/Utils'
import { useQueryParams } from '@common/hooks'
import { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { PMSPipelineSummaryResponse, PipelineInfoConfig } from 'services/pipeline-ng'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { createTemplate } from '@pipeline/utils/templateUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import routes from '@common/RouteDefinitions'
import { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { getRouteProps } from '@pipeline/pages/pipeline-list/PipelineListUtils'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { DefaultNewPipelineId, DefaultPipeline } from '../PipelineStudio/PipelineContext/PipelineActions'
import CreatePipelines from '../PipelineStudio/CreateModal/PipelineCreate'

export interface PipelineWithGitContextFormProps extends PipelineInfoConfig {
  repo?: string
  branch?: string
  connectorRef?: string
  filePath?: string
  storeType?: string
}

export interface PipelineMetadataForRouter {
  updatedPipeline: PipelineInfoConfig
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  yamlSyntax?: YamlVersion
}

export interface UseCreatePipelineModalY1Return {
  openCreatePipelineModalY1: ShowModal
}

const useCreatePipelineModalY1 = (): UseCreatePipelineModalY1Return => {
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const history = useHistory()
  const { getRBACErrorMessage } = useRBACError()
  const { getTemplate } = useTemplateSelector()
  const { CI_YAML_VERSIONING } = useFeatureFlags()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { branch, repoName, connectorRef, storeType } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const pathParams = useParams<PipelineListPagePathParams>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = useParams<
    PipelineType<PipelinePathProps> & GitQueryParams
  >()

  const [pipeline, setPipeline] = React.useState(DefaultPipeline)
  const [useTemplate, setUseTemplate] = React.useState<boolean>(false)
  const [gitDetails, setGitDetails] = React.useState<EntityGitDetails>({})
  const [storeMetadata, setStoreMetadata] = React.useState<StoreMetadata>({})
  const [yamlSyntax, setYamlSyntax] = React.useState<YamlVersion>()

  const {
    data: gitXSetting,
    error: gitXSettingError,
    loading: loadingSetting
  } = useGetSettingsList({
    queryParams: {
      category: 'GIT_EXPERIENCE',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: isGitSyncEnabled || pipelineIdentifier !== DefaultNewPipelineId
  })

  const dialogWidth = React.useMemo<number | undefined>(() => {
    if (supportingGitSimplification) {
      return 800
    } else if (isGitSyncEnabled) {
      return 614
    }
  }, [supportingGitSimplification, isGitSyncEnabled])

  const getPipelineStoreType = (): StoreMetadata['storeType'] => {
    if (getSettingValue(gitXSetting, SettingType.ENFORCE_GIT_EXPERIENCE) === 'true') {
      return StoreType.REMOTE // Creating new with GitX enforced
    } else {
      // Handling rest all use cases
      // Retaining previous storeType for editing while creating
      return pipeline?.identifier === DefaultNewPipelineId ? getDefaultStoreType(gitXSetting) : storeType
    }
  }

  const getPipelineTemplate = async (): Promise<void> => {
    const { template: newTemplate, isCopied } = await getTemplate({
      templateType: 'Pipeline',
      gitDetails,
      storeMetadata
    })
    const processNode = isCopied
      ? produce(
          defaultTo(
            parse<{ template: { spec: StepElementConfig } }>(defaultTo(newTemplate?.yaml, ''))?.template.spec,
            {}
          ) as PipelineInfoConfig,
          draft => {
            draft.name = defaultTo(pipeline?.name, '')
            draft.identifier = defaultTo(pipeline?.identifier, '')
          }
        )
      : createTemplate(pipeline, newTemplate, gitDetails?.branch, gitDetails?.repoName)
    processNode.description = pipeline.description
    processNode.tags = pipeline.tags
    processNode.projectIdentifier = pipeline.projectIdentifier
    processNode.orgIdentifier = pipeline.orgIdentifier
    setPipeline(processNode)
    hideModal()
    goToPipelineStudio({ updatedPipeline: processNode, yamlSyntax })
  }

  React.useEffect(() => {
    if (!loadingSetting && gitXSettingError) {
      showError(getRBACErrorMessage(gitXSettingError))
    }
  }, [gitXSettingError, showError, loadingSetting, getRBACErrorMessage])

  const onCloseCreate = (): void => {
    hideModal()
  }

  React.useEffect(() => {
    if (
      useTemplate &&
      (!isGitSyncEnabled || !isEmpty(gitDetails)) &&
      (!supportingGitSimplification || !isEmpty(storeMetadata))
    ) {
      getPipelineTemplate()
        .catch(_ => {
          // Do nothing.. user cancelled template selection
        })
        .finally(() => {
          setUseTemplate(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useTemplate, gitDetails, isGitSyncEnabled, storeMetadata, supportingGitSimplification])

  const goToPipelineStudioV1 = (updatedPipeline?: PMSPipelineSummaryResponse): void =>
    history.push(routes.toPipelineStudioV1(getRouteProps(pathParams, updatedPipeline)))

  const goToPipelineStudio = (pipelineMetadata: PipelineMetadataForRouter): void => {
    const pipelineSummary: PMSPipelineSummaryResponse = { identifier: '-1' }
    isSimplifiedYAMLEnabled(pathParams.module, CI_YAML_VERSIONING)
      ? goToPipelineStudioV1({ identifier: '-1' })
      : pipelineMetadata?.yamlSyntax === YamlVersion[1]
      ? history.push(
          routes.toPipelineStudio({
            ...getRouteProps(pathParams, pipelineSummary)
          }),
          pipelineMetadata
        )
      : history.push(routes.toPipelineStudio(getRouteProps(pathParams, pipelineSummary)), pipelineMetadata)
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <ModalDialog
        width={dialogWidth}
        enforceFocus={false}
        isOpen={true}
        onClose={onCloseCreate}
        showOverlay={loadingSetting}
        title={getString('moduleRenderer.newPipeLine')}
      >
        <CreatePipelines
          afterSave={onSubmit}
          initialValues={Object.assign({}, pipeline, {
            repo: repoName || '',
            branch: branch || '',
            connectorRef: defaultTo(connectorRef, ''),
            storeType: getPipelineStoreType(),
            filePath: defaultTo(gitDetails?.filePath, '')
          })}
          closeModal={onCloseCreate}
          gitDetails={{ remoteFetchFailed: false } as IGitContextFormProps}
          primaryButtonText={getString('start')}
          isReadonly={false}
          isGitXEnforced={getSettingValue(gitXSetting, SettingType.ENFORCE_GIT_EXPERIENCE) === 'true'}
          canSelectVersion={true}
        />
      </ModalDialog>
    )
  }, [
    supportingGitSimplification,
    isGitSyncEnabled,
    loadingSetting,
    getSettingValue(gitXSetting, SettingType.DEFAULT_STORE_TYPE_FOR_ENTITIES),
    getSettingValue(gitXSetting, SettingType.ENFORCE_GIT_EXPERIENCE),
    pipeline,
    pipelineIdentifier,
    repoName,
    branch,
    connectorRef
  ])

  const onSubmit = React.useCallback(
    (
      values: PipelineInfoConfig,
      currStoreMetadata?: StoreMetadata,
      updatedGitDetails?: EntityGitDetails,
      shouldUseTemplate = false,
      updatedYamlSyntax = YamlVersion[0]
    ) => {
      const updatedPipeline = produce(pipeline, draft => {
        draft.name = values.name
        draft.description = values.description
        draft.identifier = values.identifier
        draft.tags = values.tags ?? {}
        draft = omit(draft as PipelineWithGitContextFormProps, [
          'repo',
          'branch',
          'connectorRef',
          'filePath',
          'storeType'
        ])
      })
      setYamlSyntax(updatedYamlSyntax)
      setPipeline(updatedPipeline)
      if (currStoreMetadata?.storeType) {
        setStoreMetadata(currStoreMetadata)
      }

      if (updatedGitDetails) {
        if (gitDetails?.objectId || gitDetails?.commitId) {
          updatedGitDetails = { ...gitDetails, ...updatedGitDetails }
        }
        setGitDetails(updatedGitDetails)
      }
      if (shouldUseTemplate) {
        setUseTemplate(shouldUseTemplate)
      } else {
        hideModal()
        goToPipelineStudio({
          updatedPipeline,
          gitDetails: updatedGitDetails,
          storeMetadata: currStoreMetadata?.storeType ? currStoreMetadata : storeMetadata,
          yamlSyntax: updatedYamlSyntax
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hideModal, pipeline]
  )

  return { openCreatePipelineModalY1: showModal }
}

export default useCreatePipelineModalY1
