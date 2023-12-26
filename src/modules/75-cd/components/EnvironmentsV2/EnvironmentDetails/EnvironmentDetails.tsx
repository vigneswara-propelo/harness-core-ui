/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Expander } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import cx from 'classnames'
import { defaultTo, isEqual, merge, omit, set, get } from 'lodash-es'
import * as Yup from 'yup'

import {
  Button,
  ButtonVariation,
  Container,
  Layout,
  Page,
  Tabs,
  Text,
  VisualYamlSelectedView as SelectedView,
  Formik,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import produce from 'immer'
import { Color } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import {
  EnvironmentRequestDTO,
  EnvironmentResponse,
  EnvironmentResponseDTO,
  GitErrorMetadataDTO,
  NGEnvironmentConfig,
  NGEnvironmentInfoConfig,
  ResponseEnvironmentResponse,
  UpdateEnvironmentV2QueryParams,
  updateEnvironmentV2Promise,
  useGetEnvironmentV2,
  useGetSettingValue,
  EntityGitDetails
} from 'services/cd-ng'

import type {
  EnvironmentPathProps,
  EnvironmentQueryParams,
  GitQueryParams,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'

import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'
import EntityUsage from '@common/pages/entityUsage/EntityUsage'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import { sanitize } from '@common/utils/JSONUtils'
import { SettingType } from '@common/constants/Utils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '@modules/70-pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import GitRemoteDetails from '@modules/10-common/components/GitRemoteDetails/GitRemoteDetails'
import NoEntityFound from '@modules/70-pipeline/pages/utils/NoEntityFound/NoEntityFound'
import { useSaveToGitDialog } from '@modules/10-common/modals/SaveToGitDialog/useSaveToGitDialog'
import { GitData } from '@modules/10-common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { DefaultPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { DefaultNewStageId, DefaultNewStageName } from '@cd/components/Services/utils/ServiceUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import { PageHeaderTitle, PageHeaderToolbar } from './EnvironmentDetailsPageHeader'
import EnvironmentConfiguration from './EnvironmentConfiguration/EnvironmentConfiguration'
import { ServiceOverrides } from './ServiceOverrides/ServiceOverrides'
import InfrastructureDefinition from './InfrastructureDefinition/InfrastructureDefinition'
import { EnvironmentDetailsTab } from '../utils'
import GitOpsCluster from './GitOpsCluster/GitOpsCluster'
import EnvironmentDetailSummary from './EnvironmentDetailSummary/EnvironmentDetailSummary'

import css from './EnvironmentDetails.module.scss'

export default function EnvironmentDetails(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()
  const {
    sectionId,
    storeType,
    connectorRef,
    repoName,
    branch = ''
  } = useQueryParams<EnvironmentQueryParams & GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<EnvironmentQueryParams & GitQueryParams>()

  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { CDS_SERVICE_OVERRIDES_2_0, CDS_ENV_GITX } = useFeatureFlags()
  const environmentSummaryEnabled = projectIdentifier

  const { data: enableServiceOverrideSettings, error: enableServiceOverrideSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: false
  })

  const isServiceOverridesEnabled = CDS_SERVICE_OVERRIDES_2_0 && enableServiceOverrideSettings?.data?.value === 'true'

  React.useEffect(() => {
    if (enableServiceOverrideSettingsError) {
      showError(getRBACErrorMessage(enableServiceOverrideSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableServiceOverrideSettingsError])

  const formikRef = useRef<FormikProps<NGEnvironmentInfoConfig>>()

  const [selectedTabId, setSelectedTabId] = useState<EnvironmentDetailsTab>(
    EnvironmentDetailsTab[
      EnvironmentDetailsTab[defaultTo(sectionId, environmentSummaryEnabled ? 'SUMMARY' : 'CONFIGURATION')]
    ]
  )
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [updateLoading, setUpdateLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [isModified, setIsModified] = useState(false)
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)

  const { data, loading, error, refetch } = useGetEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      ...(storeType === StoreType.REMOTE
        ? {
            connectorRef,
            repoName,
            ...(branch ? { branch } : { loadFromFallbackBranch: true })
          }
        : {})
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    environmentIdentifier: defaultTo(environmentIdentifier, '')
  })

  function handleReloadFromCache(): void {
    refetch({
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
  }

  const environmentCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)
  const isEnvironmentRemote = CDS_ENV_GITX && storeType === 'REMOTE'

  const environmentDetails = defaultTo(get(data, 'data.environment'), {}) as EnvironmentResponseDTO
  const gitDetails = defaultTo(get(environmentDetails, 'entityGitDetails'), {}) as EntityGitDetails

  const hasRemoteFetchFailed = useMemo(() => {
    const errorMetadata = (error?.data as any)?.metadata as GitErrorMetadataDTO
    return Boolean(error?.status === 400 && errorMetadata?.branch)
  }, [error?.data, error?.status])

  const onGitBranchChange = (selectedFilter: { branch: string }): void => {
    setSelectedView(SelectedView.VISUAL)
    updateQueryParams({ branch: selectedFilter.branch })
  }

  const renderRemoteDetails = (): JSX.Element | null => {
    return isEnvironmentRemote ? (
      <div className={css.gitRemoteDetailsWrapper}>
        <GitRemoteDetails
          connectorRef={connectorRef}
          repoName={defaultTo(gitDetails.repoName, repoName)}
          filePath={defaultTo(gitDetails.filePath, '')}
          fileUrl={defaultTo(gitDetails.fileUrl, '')}
          branch={defaultTo(gitDetails.branch, branch)}
          onBranchChange={onGitBranchChange}
          flags={{
            readOnly: false
          }}
        />
        {!hasRemoteFetchFailed && (
          <EntityCachedCopy
            ref={environmentCachedCopyRef}
            cacheResponse={environmentDetails.cacheResponseMetadataDTO}
            reloadContent={getString('environment')}
            reloadFromCache={handleReloadFromCache}
            repo={defaultTo(gitDetails.repoName, repoName)}
            filePath={defaultTo(gitDetails.filePath, '')}
          />
        )}
      </div>
    ) : null
  }

  useEffect(() => {
    // istanbul ignore else
    if (!loading && firstLoad) {
      setFirstLoad(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const afterUpdateHandler = (response: ResponseEnvironmentResponse): void => {
    if (response.status === 'SUCCESS') {
      showSuccess(getString('common.environmentUpdated'))
      setIsModified(false)
      if (response.data?.environment?.storeType === StoreType.REMOTE) {
        updateQueryParams({ branch: response.data?.environment?.entityGitDetails?.branch })
      } else {
        refetch()
      }
    } else {
      throw response
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: GitData, environmentPayload?: EnvironmentRequestDTO): Promise<ResponseEnvironmentResponse> => {
      return updateEnvironmentV2Promise({
        body: { ...environmentPayload } as EnvironmentRequestDTO,

        queryParams: {
          accountIdentifier: accountId,
          storeType: StoreType.REMOTE,
          connectorRef: environmentDetails.connectorRef,
          isNewBranch: gitData?.isNewBranch,
          repoIdentifier: repoName,
          filePath: gitDetails.filePath,
          ...(gitData?.isNewBranch
            ? { baseBranch: gitDetails.branch, branch: gitData?.branch }
            : { branch: gitDetails.branch }),
          commitMsg: gitData?.commitMsg,
          lastObjectId: gitDetails.objectId,
          lastCommitId: gitDetails.commitId,
          resolvedConflictCommitId: gitData?.resolvedConflictCommitId
        } as unknown as UpdateEnvironmentV2QueryParams
      }).then(response => {
        afterUpdateHandler(response)
        return response
      })
    }
  })

  const onUpdate = async (values: EnvironmentResponseDTO): Promise<void> => {
    setUpdateLoading(true)
    clear()
    try {
      const bodyWithoutYaml = {
        name: values.name,
        description: values.description,
        identifier: values.identifier,
        orgIdentifier: values.orgIdentifier,
        projectIdentifier: values.projectIdentifier,
        tags: values.tags,
        type: defaultTo(values.type, 'Production')
      }

      const body = {
        ...bodyWithoutYaml,
        yaml: yamlStringify({
          environment: sanitize(
            { ...omit(values, 'repoName', 'connectorRef', 'filePath', 'storeType') },
            { removeEmptyObject: false, removeEmptyString: false }
          )
        })
      }

      if (storeType === 'REMOTE') {
        openSaveToGitDialog({
          isEditing: true,
          resource: {
            type: 'Environment',
            name: defaultTo(values.name, ''),
            identifier: defaultTo(values.identifier, ''),
            gitDetails: gitDetails,
            storeMetadata: {
              storeType: environmentDetails.storeType,
              connectorRef: environmentDetails.connectorRef
            }
          },
          payload: body
        })
      } else {
        const response = await updateEnvironmentV2Promise({
          body,
          queryParams: {
            accountIdentifier: accountId
          },
          requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
        })

        // istanbul ignore else
        afterUpdateHandler(response)
      }
    } catch (e) {
      showError(getErrorInfoFromErrorObject(e, true))
    }
    setUpdateLoading(false)
  }

  const { createdAt, environment: { yaml } = {}, lastModifiedAt } = defaultTo(data?.data, {}) as EnvironmentResponse

  const handleTabChange = (tabId: EnvironmentDetailsTab): void => {
    updateQueryParams({
      sectionId: EnvironmentDetailsTab[EnvironmentDetailsTab[tabId]]
    })
    setSelectedTabId(tabId)
  }
  const parsedYamlEnvironment = useMemo(
    () => (yamlParse(defaultTo(yaml, '{}')) as NGEnvironmentConfig)?.environment,
    [yaml]
  )
  const { name, identifier, description, tags, type } = defaultTo(parsedYamlEnvironment, {}) as NGEnvironmentInfoConfig
  const variables = defaultTo(parsedYamlEnvironment?.variables, [])
  const overrides = parsedYamlEnvironment?.overrides
  const validate = (values: NGEnvironmentInfoConfig): void => {
    const {
      name: newName,
      description: newDescription,
      tags: newTags,
      type: newType,
      variables: newVariables,
      overrides: newOverrides
    } = values

    if (
      name === newName &&
      description === newDescription &&
      isEqual(tags, newTags) &&
      type === newType &&
      (isServiceOverridesEnabled ? true : isEqual(variables, newVariables) && isEqual(overrides, newOverrides))
    ) {
      setIsModified(false)
    } else {
      setIsModified(true)
    }
  }
  const initialGitFormValue = {
    connectorRef: environmentDetails.connectorRef,
    repoName: gitDetails.repoName,
    filePath: gitDetails.filePath,
    storeType: environmentDetails.storeType
  }

  const pipeline = React.useMemo(
    () =>
      produce({ ...DefaultPipeline }, draft => {
        set(
          draft,
          'stages[0].stage',
          merge({}, {} as DeploymentStageElementConfig, {
            name: DefaultNewStageName,
            identifier: DefaultNewStageId,
            type: StageType.DEPLOY,
            spec: {}
          })
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('UPDATE_ENVIRONMENT_VARIABLES', { detail: { variables: variables } }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.environment])

  return (
    <>
      <HelpPanel referenceId="environmentDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      {(firstLoad || error) && !hasRemoteFetchFailed ? null : (
        <Page.Header
          className={cx({ [css.environmentDetailsHeader]: Boolean(description) })}
          size={'large'}
          title={
            <PageHeaderTitle
              name={name}
              identifier={defaultTo(identifier, environmentIdentifier)}
              description={description}
              tags={tags}
              type={type}
              renderRemoteDetails={renderRemoteDetails}
              hasRemoteFetchFailed={hasRemoteFetchFailed}
            />
          }
          toolbar={!hasRemoteFetchFailed && <PageHeaderToolbar createdAt={createdAt} lastModifiedAt={lastModifiedAt} />}
        />
      )}
      <Page.Body
        error={/*istanbul ignore next */ !hasRemoteFetchFailed && error?.message}
        loading={loading || updateLoading}
      >
        {hasRemoteFetchFailed && (
          <NoEntityFound
            identifier={environmentIdentifier as string}
            entityType={'environment'}
            errorObj={error?.data as unknown as Error}
          />
        )}
        {identifier && (
          <Formik<NGEnvironmentInfoConfig>
            initialValues={
              {
                name,
                identifier,
                description,
                tags,
                type,
                orgIdentifier: orgIdentifier,
                projectIdentifier: projectIdentifier,
                ...(!isServiceOverridesEnabled && {
                  variables,
                  overrides
                }),
                ...initialGitFormValue
              } as NGEnvironmentInfoConfig
            }
            formName="editEnvironment"
            onSubmit={
              /* istanbul ignore next */ values => {
                onUpdate?.({
                  ...values
                })
              }
            }
            validationSchema={Yup.object().shape({
              name: NameSchema(getString, { requiredErrorMsg: getString('fieldRequired', { field: 'Name' }) }),
              identifier: IdentifierSchema(getString)
            })}
            validateOnChange
            // added for git-branch change functionality , shouldn't impact any existing flows
            enableReinitialize
            validate={validate}
          >
            {formikProps => {
              formikRef.current = formikProps
              return (
                <Container className={css.environmentDetailsBody}>
                  <Tabs
                    id="environmentDetails"
                    onChange={handleTabChange}
                    selectedTabId={selectedTabId}
                    data-tabId={selectedTabId}
                    tabList={[
                      {
                        id: EnvironmentDetailsTab.SUMMARY,
                        title: getString('summary'),
                        panel: <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />,
                        hidden: !environmentSummaryEnabled
                      },
                      {
                        id: EnvironmentDetailsTab.CONFIGURATION,
                        title: getString('configuration'),
                        panel: (
                          <PipelineVariablesContextProvider pipeline={pipeline}>
                            <EnvironmentConfiguration
                              formikProps={formikProps}
                              selectedView={selectedView}
                              setSelectedView={setSelectedView}
                              yamlHandler={yamlHandler}
                              setYamlHandler={setYamlHandler}
                              isModified={isModified}
                              data={data}
                              isEdit
                              context={PipelineContextType.Standalone}
                              scope={getScopeFromDTO({
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier
                              })}
                              isServiceOverridesEnabled={isServiceOverridesEnabled}
                            />
                          </PipelineVariablesContextProvider>
                        )
                      },
                      {
                        id: EnvironmentDetailsTab.SERVICE_OVERRIDES,
                        title: getString('common.serviceOverrides.labelText'),
                        panel: <ServiceOverrides />,
                        hidden: isServiceOverridesEnabled
                      },
                      {
                        id: EnvironmentDetailsTab.INFRASTRUCTURE,
                        title: getString('cd.infrastructure.infrastructureDefinitions'),
                        panel: <InfrastructureDefinition isEnvPage />
                      },
                      {
                        id: EnvironmentDetailsTab.GITOPS,
                        title: getString('cd.gitOpsCluster'),
                        panel: <GitOpsCluster envRef={identifier} />
                      },
                      {
                        id: EnvironmentDetailsTab.REFERENCED_BY,
                        title: getString('referencedBy'),
                        panel: (
                          <EntityUsage entityType={EntityType.Environment} entityIdentifier={environmentIdentifier} />
                        )
                      }
                    ]}
                  >
                    <Expander />
                    {(selectedTabId === EnvironmentDetailsTab.CONFIGURATION || selectedView === SelectedView.YAML) && (
                      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
                        {isModified && (
                          <Text
                            color={Color.ORANGE_600}
                            font={{ size: 'small', weight: 'bold' }}
                            icon={'dot'}
                            iconProps={{ color: Color.ORANGE_600 }}
                          >
                            {getString('unsavedChanges')}
                          </Text>
                        )}
                        <Button
                          variation={ButtonVariation.PRIMARY}
                          type={'submit'}
                          text={getString('save')}
                          data-id="environment-edit"
                          onClick={
                            /* istanbul ignore next */ () => {
                              if (selectedView === SelectedView.YAML) {
                                const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), '')
                                yamlHandler?.getYAMLValidationErrorMap()?.size
                                  ? showError(getString('common.validation.invalidYamlText'))
                                  : onUpdate(parse(latestYaml)?.environment)
                              } else {
                                formikProps.submitForm()
                              }
                            }
                          }
                          disabled={!isModified}
                        />
                        <Button
                          variation={ButtonVariation.TERTIARY}
                          text={getString('pipeline.discard')}
                          onClick={
                            /* istanbul ignore next */ () => {
                              formikRef?.current?.setValues({
                                name: defaultTo(name, ''),
                                identifier: defaultTo(identifier, ''),
                                description: description,
                                tags: defaultTo(tags, {}),
                                orgIdentifier: defaultTo(orgIdentifier, ''),
                                projectIdentifier: defaultTo(projectIdentifier, ''),
                                type: defaultTo(type, 'Production'),
                                ...(!isServiceOverridesEnabled && {
                                  variables,
                                  overrides
                                })
                              })
                              setIsModified(false)
                            }
                          }
                          disabled={!isModified}
                        />
                      </Layout.Horizontal>
                    )}
                  </Tabs>
                </Container>
              )
            }}
          </Formik>
        )}
      </Page.Body>
    </>
  )
}
