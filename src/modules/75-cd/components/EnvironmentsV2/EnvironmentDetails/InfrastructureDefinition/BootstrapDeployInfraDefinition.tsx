/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  Formik,
  getErrorInfoFromErrorObject,
  Layout,
  Tag,
  useToaster,
  VisualYamlToggle,
  VisualYamlSelectedView as SelectedView,
  SelectOption,
  FormInput
} from '@harness/uicore'
import { defaultTo, get, isBoolean, isEmpty, isEqual, noop, omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import produce from 'immer'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'

import type { EnvironmentQueryParams, GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import {
  CustomDeploymentConnectorNGVariable,
  DeploymentStageConfig,
  EntityGitDetails,
  InfrastructureConfig,
  InfrastructureDefinitionConfig,
  InfrastructureResponseDTO,
  ResponseInfrastructureResponse,
  useCreateInfrastructure,
  useGetYamlSchema,
  useUpdateInfrastructure,
  validateInfrastructureForDeploymentTemplatePromise
} from 'services/cd-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { TemplateSummaryResponse, useGetTemplate } from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Scope } from '@common/interfaces/SecretsInterface'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getTemplateRefVersionLabelObject } from '@pipeline/utils/templateUtils'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { PipelineInfoConfig, StageElementConfig, TemplateLinkConfig } from 'services/pipeline-ng'
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import ReconcileInfraDialogWrapper from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/ReconcileHandler/ReconcileInfraDialogWrapper'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployServiceSpecifications/SelectDeploymentType/SelectDeploymentType'
import DeployInfraDefinition from '@cd/components/PipelineStudio/DeployInfraSpecifications/DeployInfraDefinition/DeployInfraDefinition'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { InfraDefinitionWrapperRef } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinitionWrapper'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { useFeatureFlag, useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { GitSyncFormFields, gitSyncFormSchema } from '@modules/40-gitsync/components/GitSyncForm/GitSyncForm'
import { useSaveToGitDialog } from '@modules/10-common/modals/SaveToGitDialog/useSaveToGitDialog'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { ConnectorSelectedValue } from '@modules/27-platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { GitData } from '@modules/10-common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { MultiTypeServiceField } from '@modules/70-pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { NewInfrastructureForm } from './NewInfrastructureForm'
import stageCss from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStage.module.scss'
import css from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureDefinition.module.scss'

export interface CombinedInfrastructureDefinationResponse
  extends InfrastructureDefinitionConfig,
    Pick<InfrastructureResponseDTO, 'connectorRef' | 'storeType' | 'entityGitDetails'> {}

interface ScopedServiceFormikValues {
  scopedServices: SelectOption[]
  scopeToSpecificServices: boolean
}

interface BootstrapDeployInfraDefinitionProps {
  closeInfraDefinitionDetails: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  infrastructureDefinition?: CombinedInfrastructureDefinationResponse
  environmentIdentifier: string
  isReadOnly: boolean
  scope: Scope
  stageDeploymentType?: ServiceDeploymentType
  stageCustomDeploymentData?: TemplateLinkConfig
  selectedInfrastructure?: string
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
  isDrawerView?: boolean
  setInfraSaveInProgress?: (data: boolean) => void
  handleInfrastructureUpdate?: (updatedInfrastructure: InfrastructureConfig) => void
  isInfraUpdated?: boolean
  updatedInfra?: InfrastructureConfig
  isSingleEnv?: boolean
  infrastructureResponse?: InfrastructureResponseDTO
}

interface CustomDeploymentMetaData {
  templateMetaData: TemplateLinkConfig
  variables: Array<CustomDeploymentConnectorNGVariable>
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `infrastructureDefinition.yaml`,
  entityType: 'Infrastructure',
  width: '100%',
  height: 540,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export interface GetInfraDefinitionConfigParams {
  formikValues?: Partial<InfrastructureDefinitionConfig>
  scope: Scope
  environmentIdentifier: string
  pipeline: PipelineInfoConfig
  orgIdentifier: string
  projectIdentifier: string
  scopedServices?: string[]
}

export const getInfraDefinitionConfig = (params: GetInfraDefinitionConfigParams) => {
  const {
    formikValues = {},
    scope,
    environmentIdentifier,
    pipeline,
    orgIdentifier,
    projectIdentifier,
    scopedServices
  } = params
  return {
    ...formikValues,
    orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
    projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
    environmentRef: getIdentifierFromScopedRef(environmentIdentifier),
    deploymentType: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.serviceConfig?.serviceDefinition?.type,
    type: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition?.type,
    spec: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition?.spec,
    allowSimultaneousDeployments: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
      ?.allowSimultaneousDeployments,
    scopedServices
  } as InfrastructureDefinitionConfig
}

function BootstrapDeployInfraDefinition(
  {
    closeInfraDefinitionDetails,
    refetch,
    infrastructureDefinition,
    environmentIdentifier,
    isReadOnly = false,
    scope,
    stageDeploymentType,
    stageCustomDeploymentData,
    selectedInfrastructure,
    getTemplate,
    isDrawerView = false,
    setInfraSaveInProgress,
    handleInfrastructureUpdate,
    isInfraUpdated,
    updatedInfra,
    isSingleEnv,
    infrastructureResponse
  }: BootstrapDeployInfraDefinitionProps,
  infraDefinitionFormRef: React.ForwardedRef<InfraDefinitionWrapperRef>
): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    setSelection,
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const queryParams = useParams<ProjectPathProps>()
  const { infraStoreType, connectorRef, repoName } = useQueryParams<EnvironmentQueryParams & GitQueryParams>()

  const {
    state: { gitDetails, storeMetadata }
  } = usePipelineContext()
  const { checkErrorsForTab } = useContext(StageErrorContext)

  const { name, identifier, description, tags, scopedServices } = defaultTo(
    infrastructureDefinition,
    {}
  ) as InfrastructureDefinitionConfig & { scopedServices?: string[] }

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [isSavingInfrastructure, setIsSavingInfrastructure] = useState(false)
  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>()
  const [isYamlEditable, setIsYamlEditable] = useState(false)
  const [showReconcile, setShowReconcile] = useState(false)
  const [formValues, setFormValues] = useState({
    name,
    identifier,
    description,
    tags
  })

  useEffect(() => {
    setFormValues({
      name: infrastructureDefinition?.name,
      identifier: infrastructureDefinition?.identifier,
      description: infrastructureDefinition?.description,
      tags: infrastructureDefinition?.tags
    })
  }, [infrastructureDefinition])

  const [selectedScopedServices, setSelectedScopedServices] = useState<string[] | undefined>(scopedServices)

  const { CDS_SCOPE_INFRA_TO_SERVICES } = useFeatureFlags()
  const formikRef = useRef<FormikProps<Partial<CombinedInfrastructureDefinationResponse & GitSyncFormFields>>>()
  const formikRefValues = formikRef.current?.values
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const getDeploymentTemplateData = useCallback((): CustomDeploymentMetaData => {
    const variables = get(stage, 'stage.spec.infrastructure.infrastructureDefinition.spec.variables')
    return {
      templateMetaData: get(stage, 'stage.spec.infrastructure.infrastructureDefinition.spec.customDeploymentRef'),
      ...(variables && { variables })
    }
  }, [stage])

  const [customDeploymentMetaData, setCustomDeploymentMetaData] = useState<CustomDeploymentMetaData | undefined>(
    getDeploymentTemplateData()
  )
  const selectedDeploymentTemplateRef = useRef<TemplateSummaryResponse | undefined>()
  const fromTemplateSelectorRef = useRef(false)

  const [deployInfraRemountCount, setDeployInfraRemountCount] = useState(0)

  const shouldFetchCustomDeploymentTemplate =
    !isEmpty(stageCustomDeploymentData) &&
    isEmpty(getDeploymentTemplateData()?.templateMetaData) &&
    isEmpty(selectedInfrastructure)

  const { data: customDeploymentTemplateResponse } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(defaultTo(stageCustomDeploymentData?.templateRef, '')),
    queryParams: {
      ...getScopeBasedProjectPathParams(
        queryParams,
        getScopeFromValue(defaultTo(stageCustomDeploymentData?.templateRef, ''))
      ),
      versionLabel: defaultTo(stageCustomDeploymentData?.versionLabel, ''),
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params: queryParams,
        repoIdentifier: gitDetails.repoIdentifier,
        branch: gitDetails.branch
      })
    },
    lazy: !shouldFetchCustomDeploymentTemplate
  })

  const environmentEditPermissions: ButtonProps['permission'] = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environmentIdentifier
    },
    resourceScope: {
      accountIdentifier: accountId,
      ...(scope !== Scope.ACCOUNT && { orgIdentifier }),
      ...(scope === Scope.PROJECT && { projectIdentifier })
    },
    permission: PermissionIdentifier.EDIT_ENVIRONMENT
  }

  React.useEffect(() => {
    if (customDeploymentTemplateResponse?.data) {
      const customDeploymentTemplate = customDeploymentTemplateResponse?.data
      const templateRefObj = getTemplateRefVersionLabelObject(customDeploymentTemplate)
      const templateJSON = parse(customDeploymentTemplate.yaml || '').template
      setCustomDeploymentMetaData({
        templateMetaData: templateRefObj,
        variables: templateJSON?.spec?.infrastructure?.variables
      })
    }
  }, [customDeploymentTemplateResponse?.data])

  useEffect(() => {
    setSelection({
      stageId: 'stage_id'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (setInfraSaveInProgress) {
      setInfraSaveInProgress(isSavingInfrastructure)
    }
  }, [isSavingInfrastructure])

  useEffect(() => {
    if (selectedStageId && stageDeploymentType) {
      handleDeploymentTypeChange(stageDeploymentType, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageId])

  useDeepCompareEffect(() => {
    if (customDeploymentMetaData) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.type', ServiceDeploymentType.CustomDeployment)
          set(
            draft,
            'stage.spec.infrastructure.infrastructureDefinition.spec.customDeploymentRef',
            customDeploymentMetaData?.templateMetaData
          )
          set(
            draft,
            'stage.spec.infrastructure.infrastructureDefinition.spec.variables',
            customDeploymentMetaData?.variables
          )
        }
      })
      updateStage(stageData?.stage as StageElementConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDeploymentMetaData])

  const { data: infrastructureDefinitionSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Infrastructure',
      identifier,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: scope
    }
  })

  const validateInfrastructureReconcile = async (): Promise<void> => {
    try {
      const response = await validateInfrastructureForDeploymentTemplatePromise({
        infraIdentifier: identifier as string,
        queryParams: {
          accountIdentifier: accountId,
          envIdentifier: environmentIdentifier,
          orgIdentifier,
          projectIdentifier
        }
      })
      if (response?.data) {
        setShowReconcile(!!response?.data?.obsolete)
      }
    } catch (error) {
      showError(error)
    }
  }

  useEffect(() => {
    if (
      stageDeploymentType === ServiceDeploymentType.CustomDeployment &&
      !isEmpty(customDeploymentMetaData?.templateMetaData)
    ) {
      validateInfrastructureReconcile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDeploymentMetaData?.templateMetaData, stageDeploymentType])

  const addOrUpdateTemplate = async (): Promise<void> => {
    if (getTemplate) {
      const { template } = await getTemplate({
        templateType: TemplateType.CustomDeployment,
        allowedUsages: [TemplateUsage.USE]
      })
      const templateJSON = parse(template.yaml || '').template
      setCustomDeploymentMetaData({
        templateMetaData: getTemplateRefVersionLabelObject(template),
        variables: templateJSON?.spec?.infrastructure?.variables
      })
      setDeployInfraRemountCount(deployInfraRemountCount + 1)
    }
  }

  const handleYamlChange = (_isEditorDirty: boolean, updatedYaml: string): void => {
    if (!isEmpty(infrastructureDefinition)) {
      const infraDefinitionConfigFromYaml = parse(defaultTo(updatedYaml, '{}'))
        .infrastructureDefinition as InfrastructureDefinitionConfig

      if (
        !isEmpty(infraDefinitionConfigFromYaml) &&
        !isEqual(updatedInfra?.infrastructureDefinition, infraDefinitionConfigFromYaml)
      ) {
        handleInfrastructureUpdate?.({ infrastructureDefinition: infraDefinitionConfigFromYaml })
      }
    }
  }

  const updateFormValues = (
    infrastructureDefinitionConfig: InfrastructureDefinitionConfig & { scopedServices?: string[] }
  ): void => {
    setFormValues({
      name: infrastructureDefinitionConfig.name,
      identifier: infrastructureDefinitionConfig.identifier,
      description: infrastructureDefinitionConfig.description,
      tags: infrastructureDefinitionConfig.tags,
      ...(formikRefValues?.storeType === 'REMOTE' && {
        storeType: formikRefValues?.storeType,
        connectorRef: formikRefValues?.connectorRef,
        filePath: formikRefValues?.filePath,
        branch: formikRefValues?.branch,
        repo: formikRefValues?.repo
      })
    })

    setSelectedScopedServices(infrastructureDefinitionConfig.scopedServices)

    const stageData = produce(stage, draft => {
      const infraDefinition = get(draft, 'stage.spec.infrastructure', {})
      if (infrastructureDefinitionConfig.spec) {
        infraDefinition.infrastructureDefinition.spec = infrastructureDefinitionConfig.spec
      }

      if (infrastructureDefinitionConfig.type) {
        infraDefinition.infrastructureDefinition.type = infrastructureDefinitionConfig.type
      }

      if (isBoolean(infrastructureDefinitionConfig.allowSimultaneousDeployments)) {
        infraDefinition.allowSimultaneousDeployments = infrastructureDefinitionConfig.allowSimultaneousDeployments
      }

      infraDefinition.scopedServices = infrastructureDefinitionConfig.scopedServices

      const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})

      if (infrastructureDefinitionConfig.deploymentType) {
        serviceDefinition.type = infrastructureDefinitionConfig.deploymentType

        if (selectedDeploymentType !== infrastructureDefinitionConfig.deploymentType) {
          setSelectedDeploymentType(infrastructureDefinitionConfig.deploymentType as ServiceDeploymentType)
        }
      }
    })
    updateStage(stageData?.stage as StageElementConfig)
  }

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      // istanbul ignore else
      if (view === SelectedView.VISUAL) {
        // istanbul ignore else
        if (yamlHandler?.getYAMLValidationErrorMap()?.size && isYamlEditable) {
          clear()
          showError(getString('common.validation.invalidYamlText'))
          return
        }

        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
        const yamlVisual = parse(yaml).infrastructureDefinition as InfrastructureDefinitionConfig

        // istanbul ignore else
        if (yamlVisual) {
          updateFormValues(yamlVisual)
        }
        setIsYamlEditable(false)
      }
      setSelectedView(view)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    /* istanbul ignore next */ [yamlHandler?.getLatestYaml]
  )

  const { mutate: updateInfrastructure } = useUpdateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const afterCreateUpdateHandler = (response: ResponseInfrastructureResponse): void => {
    if (response.status === 'SUCCESS') {
      showSuccess(
        getString(infrastructureDefinition ? 'cd.infrastructure.updated' : 'cd.infrastructure.created', {
          identifier: response.data?.infrastructure?.identifier
        })
      )
      setIsSavingInfrastructure(false)
      if (environmentIdentifier) {
        refetch(response.data?.infrastructure)
      } else {
        refetch()
      }
      closeInfraDefinitionDetails()
    } else {
      throw response
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: GitData, _payload?: InfrastructureResponseDTO): Promise<ResponseInfrastructureResponse> => {
      const { isNewBranch, branch, commitMsg, resolvedConflictCommitId } = gitData
      const selectedBranch = formikRefValues?.branch
      const {
        objectId,
        commitId,
        filePath,
        branch: infrastructureResponseBranch
      } = get(infrastructureResponse, 'entityGitDetails', {}) as EntityGitDetails

      const createUpdatePromise = !infrastructureDefinition
        ? createInfrastructure(
            { ..._payload, orgIdentifier, projectIdentifier },
            {
              queryParams: {
                accountIdentifier: accountId,
                storeType: StoreType.REMOTE,
                connectorRef:
                  typeof formikRefValues?.connectorRef === 'object'
                    ? (formikRefValues?.connectorRef as unknown as ConnectorSelectedValue)?.value
                    : formikRefValues?.connectorRef,
                repoName: formikRefValues?.repo,
                isNewBranch: isNewBranch,
                filePath: formikRefValues?.filePath,
                ...(isNewBranch ? { baseBranch: selectedBranch, branch: branch } : { branch: selectedBranch }),
                commitMsg: commitMsg
              }
            }
          )
        : updateInfrastructure(
            { ..._payload, orgIdentifier, projectIdentifier },
            {
              queryParams: {
                accountIdentifier: accountId,
                storeType: StoreType.REMOTE,
                connectorRef: get(infrastructureResponse, 'connectorRef'),
                isNewBranch: isNewBranch,
                filePath: filePath,
                ...(isNewBranch
                  ? { baseBranch: infrastructureResponseBranch, branch: branch }
                  : { branch: infrastructureResponseBranch }),
                commitMsg: commitMsg,
                lastObjectId: objectId,
                lastCommitId: commitId,
                resolvedConflictCommitId: resolvedConflictCommitId
              }
            }
          )

      return createUpdatePromise.then(response => {
        afterCreateUpdateHandler(response)
        return response
      })
    },
    onProgessOverlayClose: () => {
      setInfraSaveInProgress?.(false)
      setIsSavingInfrastructure(false)
    },
    onClose: () => {
      setInfraSaveInProgress?.(false)
      setIsSavingInfrastructure(false)
    }
  })

  const mutateFn = infrastructureDefinition ? updateInfrastructure : createInfrastructure

  const onSubmit = (values: CombinedInfrastructureDefinationResponse): void => {
    setIsSavingInfrastructure(true)
    const body = omit(values, ['spec', 'allowSimultaneousDeployments', 'connectorRef', 'repo'])
    const finalInfrastructureData =
      isEmpty(infrastructureDefinition) || infraStoreType === 'INLINE' ? formikRefValues : infrastructureResponse
    const finalInfrastructureGitDetails = isEmpty(infrastructureDefinition)
      ? {
          branch: formikRefValues?.branch,
          filePath: formikRefValues?.filePath,
          repoName: formikRefValues?.repo
        }
      : infrastructureResponse?.entityGitDetails

    if (finalInfrastructureData?.storeType === 'REMOTE') {
      openSaveToGitDialog({
        isEditing: !isEmpty(infrastructureDefinition),
        resource: {
          type: 'Infrastructure',
          name: finalInfrastructureData?.name as string,
          identifier: finalInfrastructureData?.identifier as string,
          gitDetails: finalInfrastructureGitDetails,
          storeMetadata: {
            storeType: StoreType.REMOTE,
            connectorRef: isEmpty(infrastructureDefinition)
              ? (finalInfrastructureData?.connectorRef as unknown as ConnectorSelectedValue)?.value
              : infrastructureResponse?.connectorRef
          }
        },
        payload: {
          ...omit(values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath']),
          orgIdentifier,
          projectIdentifier,
          yaml: yamlStringify({
            infrastructureDefinition: {
              ...omit(values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath'])
            }
          })
        }
      })
    } else {
      mutateFn({
        ...body,
        yaml: yamlStringify({
          infrastructureDefinition: {
            ...body,
            spec: values.spec,
            allowSimultaneousDeployments: values.allowSimultaneousDeployments
          }
        })
      })
        .then(response => {
          afterCreateUpdateHandler(response)
        })
        .catch(e => {
          setIsSavingInfrastructure(false)
          showError(getErrorInfoFromErrorObject(e))
        })
    }
  }

  const onCustomDeploymentSelection = async (): Promise<void> => {
    if (fromTemplateSelectorRef.current && selectedDeploymentTemplateRef.current) {
      const templateRefObj = getTemplateRefVersionLabelObject(selectedDeploymentTemplateRef.current)
      const templateJSON = parse(selectedDeploymentTemplateRef.current.yaml || '')?.template

      return setCustomDeploymentMetaData({
        templateMetaData: templateRefObj,
        variables: templateJSON?.spec?.infrastructure?.variables
      })
    }

    if (getTemplate && !stageCustomDeploymentData) {
      try {
        const { template } = await getTemplate({
          selectedTemplate: selectedDeploymentTemplateRef.current,
          templateType: TemplateType.CustomDeployment,
          allowedUsages: [TemplateUsage.USE],
          showChangeTemplateDialog: false,
          hideTemplatesView: true,
          disableUseTemplateIfUnchanged: false
        })
        const templateRefObj = getTemplateRefVersionLabelObject(template)
        const templateJSON = parse(template.yaml || '').template

        setCustomDeploymentMetaData({
          templateMetaData: templateRefObj,
          variables: templateJSON?.spec?.infrastructure?.variables
        })
      } catch (_) {
        // user cancelled template selection
      }
    }
  }

  const handleDeploymentTypeChange = (
    deploymentType: ServiceDeploymentType,
    resetInfrastructureDefinition = true
  ): void => {
    // istanbul ignore else
    if (deploymentType !== selectedDeploymentType) {
      const stageData = produce(stage, draft => {
        const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
        serviceDefinition.type = deploymentType

        if (draft?.stage?.spec?.infrastructure?.infrastructureDefinition && resetInfrastructureDefinition) {
          delete draft.stage.spec.infrastructure.infrastructureDefinition
          delete draft.stage.spec.infrastructure.allowSimultaneousDeployments
        }
      })
      setSelectedDeploymentType(deploymentType)
      const customDeploymentRef =
        stage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec?.customDeploymentRef
      if (deploymentType === ServiceDeploymentType.CustomDeployment) {
        if (isEmpty(customDeploymentRef)) {
          onCustomDeploymentSelection()
        } else {
          setCustomDeploymentMetaData(getDeploymentTemplateData())
        }
      } else {
        setCustomDeploymentMetaData(undefined)
        updateStage(stageData?.stage as StageElementConfig)
      }
    }
  }

  const onDeploymentTemplateSelect = (
    deploymentTemplate: TemplateSummaryResponse,
    fromTemplateSelector: boolean
  ): void => {
    selectedDeploymentTemplateRef.current = deploymentTemplate
    fromTemplateSelectorRef.current = fromTemplateSelector

    if (selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
      onCustomDeploymentSelection()
    } else {
      handleDeploymentTypeChange(ServiceDeploymentType.CustomDeployment)
    }
  }

  const handleEditMode = (): void => {
    setIsYamlEditable(true)
  }

  const checkForErrors = async (): Promise<void> => {
    formikRef.current?.submitForm()

    return Promise.allSettled([
      formikRef.current?.validateForm(),
      checkErrorsForTab(DeployTabs.SERVICE),
      checkErrorsForTab(DeployTabs.INFRASTRUCTURE)
    ]).then(responses => {
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !isEmpty((responses[0] as any).value) ||
        // custom condition added above to accommodate below issue. Else, next condition is enough
        // https://github.com/jaredpalmer/formik/issues/3151 - validateForm does not reject on formik validation errors
        responses.map(response => response.status).filter(status => status === 'rejected').length > 0
      ) {
        return Promise.reject()
      } else {
        return Promise.resolve()
      }
    })
  }
  const updateInfraEntity = React.useCallback(
    async (entityYaml: string) => {
      const entityInfrastructureDefinition = parse(entityYaml || '')
      const stageData = produce(stage, draft => {
        if (draft) {
          set(
            draft,
            'stage.spec.infrastructure.infrastructureDefinition.spec',
            entityInfrastructureDefinition?.infrastructureDefinition.spec
          )
        }
      })
      updateStage(stageData?.stage as StageElementConfig)
      setShowReconcile(false)
      setDeployInfraRemountCount(deployInfraRemountCount + 1)
    },
    [deployInfraRemountCount, stage, updateStage]
  )

  const refreshYAMLBuilder = React.useMemo(() => JSON.stringify({ ...stage, isYamlEditable }), [stage, isYamlEditable])

  const handleFormOnChange = (latestFormValues: Partial<InfrastructureDefinitionConfig>): void => {
    const updatedInfradefinitionConfig = getInfraDefinitionConfig({
      formikValues: latestFormValues,
      scope,
      environmentIdentifier,
      orgIdentifier,
      projectIdentifier,
      pipeline
    })
    handleInfrastructureUpdate?.({ infrastructureDefinition: updatedInfradefinitionConfig })
  }

  const handleSaveInfrastructure = (): void => {
    if (selectedView === SelectedView.YAML) {
      if (yamlHandler?.getYAMLValidationErrorMap()?.size) {
        clear()
        showError(getString('common.validation.invalidYamlText'))
      } else {
        const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
        onSubmit(parse(latestYaml)?.infrastructureDefinition)
      }
    } else {
      checkForErrors()
        .then(() => {
          onSubmit(
            getInfraDefinitionConfig({
              formikValues: formikRefValues,
              scope,
              environmentIdentifier,
              orgIdentifier,
              projectIdentifier,
              pipeline,
              scopedServices: selectedScopedServices
            }) as InfrastructureDefinitionConfig
          )
        })
        .catch(noop)
    }
  }
  const infraFormRef = !isEmpty(infraDefinitionFormRef)
    ? infraDefinitionFormRef
    : { current: { saveInfrastructure: noop } }

  useImperativeHandle(infraFormRef, () => ({
    saveInfrastructure() {
      handleSaveInfrastructure()
    }
  }))

  const initialScopedServices =
    selectedScopedServices?.map(scopedService => ({ label: scopedService, value: scopedService })) || []
  const scopedServicesInitialValues: ScopedServiceFormikValues = {
    scopedServices: initialScopedServices,
    scopeToSpecificServices: !!initialScopedServices.length
  }

  const handleSelectedScopedServiceChange = (latestScopedServicesFormikValues: ScopedServiceFormikValues): void => {
    const latestScopedServicesValues = latestScopedServicesFormikValues.scopedServices.map(
      scopedService => scopedService.value as string
    )
    const updatedInfradefinitionConfig = getInfraDefinitionConfig({
      formikValues: {},
      scope,
      environmentIdentifier,
      orgIdentifier,
      projectIdentifier,
      pipeline,
      scopedServices: latestScopedServicesValues
    })
    handleInfrastructureUpdate?.({ infrastructureDefinition: updatedInfradefinitionConfig })
    setSelectedScopedServices(latestScopedServicesValues)
  }

  // Save button is to be disabled when -
  // 1. infra save is in progress
  // 2. Infrastructure has not been updated in case of edit.
  const isSaveDisabled = isSavingInfrastructure || (!!infrastructureDefinition && !isInfraUpdated)
  const isGitXEnabledForInfras = useFeatureFlag(FeatureFlag.CDS_INFRA_GITX)

  let initialValues = {}
  const initialGitFormValues = isEmpty(selectedInfrastructure)
    ? {
        connectorRef,
        repo: repoName
      }
    : {
        connectorRef: infrastructureResponse?.connectorRef,
        repo: infrastructureResponse?.entityGitDetails?.repoName,
        filePath: infrastructureResponse?.entityGitDetails?.filePath,
        storeType: infrastructureResponse?.storeType
      }
  if (
    isEmpty(selectedInfrastructure) ||
    infraStoreType === 'REMOTE' ||
    infrastructureResponse?.storeType === 'REMOTE'
  ) {
    initialValues = { ...formValues, ...initialGitFormValues }
  } else {
    initialValues = formValues
  }

  return (
    <>
      <Layout.Vertical
        padding={{ top: 'xlarge', bottom: 'large', right: 'xxlarge', left: 'huge' }}
        className={css.body}
        background={Color.FORM_BG}
      >
        <Layout.Horizontal padding={{ bottom: 'large' }} width={'100%'}>
          <VisualYamlToggle selectedView={selectedView} onChange={handleModeSwitch} />
        </Layout.Horizontal>
        {showReconcile && (
          <ReconcileInfraDialogWrapper
            entity={TemplateErrorEntity.INFRASTRUCTURE}
            isReadOnly={isReadOnly}
            originalYaml={yamlStringify({ infrastructureDefinition })}
            updateRootEntity={updateInfraEntity}
          />
        )}
        <Container>
          {selectedView === SelectedView.VISUAL ? (
            <>
              <Card className={css.infraCardSection}>
                <Formik<Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields>
                  initialValues={initialValues}
                  formName={'infrastructure-modal'}
                  onSubmit={noop}
                  validate={values => handleFormOnChange(values)}
                  validationSchema={Yup.object().shape({
                    name: NameSchema(getString, { requiredErrorMsg: getString('fieldRequired', { field: 'Name' }) }),
                    identifier: IdentifierSchema(getString),
                    ...(isGitXEnabledForInfras && isEmpty(selectedInfrastructure)
                      ? { ...gitSyncFormSchema(getString) }
                      : {})
                  })}
                  enableReinitialize={true} // added it to render updated details after reloading from git
                >
                  {formikProps => {
                    formikRef.current = formikProps
                    return (
                      <NewInfrastructureForm
                        formikProps={
                          formikProps as FormikProps<
                            Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields
                          >
                        }
                        infrastructureDefinition={infrastructureDefinition}
                        isGitXEnabledForInfras={isGitXEnabledForInfras}
                        isEdit={!isEmpty(selectedInfrastructure)}
                        isReadOnly={isReadOnly}
                        initialValues={initialValues}
                      />
                    )
                  }}
                </Formik>
              </Card>
              <SelectDeploymentType
                viewContext="setup"
                selectedDeploymentType={selectedDeploymentType}
                isReadonly={!!stageDeploymentType || isReadOnly}
                handleDeploymentTypeChange={handleDeploymentTypeChange}
                onDeploymentTemplateSelect={onDeploymentTemplateSelect}
                shouldShowGitops={false}
                templateLinkConfig={customDeploymentMetaData?.templateMetaData}
                addOrUpdateTemplate={isEmpty(stageCustomDeploymentData) ? addOrUpdateTemplate : undefined}
              />
              {selectedDeploymentType && (
                <DeployInfraDefinition
                  key={deployInfraRemountCount}
                  selectedInfrastructure={selectedInfrastructure}
                  isSingleEnv={isSingleEnv}
                />
              )}
              {!!CDS_SCOPE_INFRA_TO_SERVICES && (infrastructureDefinition?.deploymentType || selectedDeploymentType) && (
                <Card className={stageCss.sectionCard}>
                  <Formik<ScopedServiceFormikValues>
                    initialValues={scopedServicesInitialValues}
                    formName={'scopedServicesForm'}
                    onSubmit={noop}
                    validate={values => handleSelectedScopedServiceChange(values)}
                  >
                    {scopedServiceFormikProps => {
                      return (
                        <>
                          <FormInput.CheckBox
                            name="scopeToSpecificServices"
                            label={getString('cd.scopeToSpecificServices')}
                          />
                          {scopedServiceFormikProps.values.scopeToSpecificServices && (
                            <Container className={css.inputWidth}>
                              <MultiTypeServiceField
                                name={'scopedServices'}
                                label={getString('cd.pipelineSteps.serviceTab.specifyYourServices')}
                                deploymentType={
                                  defaultTo(
                                    infrastructureDefinition?.deploymentType,
                                    selectedDeploymentType
                                  ) as ServiceDeploymentType
                                }
                                disabled={isReadOnly}
                                placeholder={getString('cd.pipelineSteps.serviceTab.selectServices')}
                                isNewConnectorLabelVisible={false}
                                isOnlyFixedType
                                isMultiSelect={true}
                                onMultiSelectChange={noop}
                                showProjectScopedEntities={scope === Scope.PROJECT}
                                showOrgScopedEntities={scope === Scope.PROJECT || scope === Scope.ORG}
                              />
                            </Container>
                          )}
                        </>
                      )
                    }}
                  </Formik>
                </Card>
              )}
            </>
          ) : (
            <div className={css.yamlBuilder}>
              <YamlBuilderMemo
                {...yamlBuilderReadOnlyModeProps}
                existingJSON={{
                  infrastructureDefinition: getInfraDefinitionConfig({
                    formikValues: omit(formikRefValues, [
                      'storeType',
                      'connectorRef',
                      'repo',
                      'branch',
                      'filePath',
                      'yaml'
                    ]),
                    scope,
                    environmentIdentifier,
                    orgIdentifier,
                    projectIdentifier,
                    pipeline,
                    scopedServices: selectedScopedServices
                  }) as InfrastructureDefinitionConfig
                }}
                key={refreshYAMLBuilder}
                onChange={handleYamlChange}
                schema={infrastructureDefinitionSchema?.data}
                bind={setYamlHandler}
                isReadOnlyMode={!isYamlEditable}
                onEnableEditMode={handleEditMode}
                isEditModeSupported={!isReadOnly}
              />
              {!isYamlEditable ? (
                <div className={css.buttonWrapper}>
                  <Tag>{getString('common.readOnly')}</Tag>
                  <RbacButton
                    permission={environmentEditPermissions}
                    variation={ButtonVariation.SECONDARY}
                    text={getString('common.editYaml')}
                    onClick={handleEditMode}
                  />
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Layout.Vertical>
      {!isDrawerView && (
        <Layout.Horizontal
          spacing={'medium'}
          padding={{ top: 'xlarge', left: 'huge', bottom: 'large' }}
          className={css.modalFooter}
        >
          <RbacButton
            text={getString('save')}
            variation={ButtonVariation.PRIMARY}
            onClick={handleSaveInfrastructure}
            disabled={isSaveDisabled}
            loading={isSavingInfrastructure}
            permission={environmentEditPermissions}
          />
          <Button
            text={getString('cancel')}
            variation={ButtonVariation.SECONDARY}
            onClick={closeInfraDefinitionDetails}
            disabled={isSavingInfrastructure}
          />
        </Layout.Horizontal>
      )}
    </>
  )
}

export const BootstrapDeployInfraDefinitionWithRef = React.forwardRef(BootstrapDeployInfraDefinition)
