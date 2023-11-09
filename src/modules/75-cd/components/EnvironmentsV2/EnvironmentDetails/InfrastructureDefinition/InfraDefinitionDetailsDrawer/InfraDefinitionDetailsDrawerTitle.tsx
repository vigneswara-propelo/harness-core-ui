/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { UseGetReturn } from 'restful-react'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { EnvironmentQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import GitRemoteDetails from '@modules/10-common/components/GitRemoteDetails/GitRemoteDetails'
import { EntityGitDetails, Failure, GetInfrastructureQueryParams, ResponseInfrastructureResponse } from 'services/cd-ng'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '@modules/70-pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import { useQueryParams, useUpdateQueryParams } from '@modules/10-common/hooks'
import css from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureDefinition.module.scss'

export function InfraDefinitionDetailsDrawerTitle(props: {
  discardChanges: () => void
  applyChanges: () => void
  scope: Scope
  environmentIdentifier: string
  infraSaveInProgress?: boolean
  isInfraUpdated?: boolean
  shouldShowActionButtons: boolean
  openUnsavedChangesDiffModal: () => void
  hasRemoteFetchFailed?: boolean
  infrastructureFetchDetails?: UseGetReturn<
    ResponseInfrastructureResponse,
    Failure | Error,
    GetInfrastructureQueryParams,
    unknown
  >
}): JSX.Element {
  const {
    discardChanges,
    applyChanges,
    scope,
    environmentIdentifier,
    infraSaveInProgress,
    shouldShowActionButtons,
    isInfraUpdated,
    openUnsavedChangesDiffModal,
    hasRemoteFetchFailed,
    infrastructureFetchDetails
  } = props
  const { loading, data, refetch } = infrastructureFetchDetails || {}

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { infraStoreType, infraBranch, infraRepoName, infraConnectorRef } = useQueryParams<EnvironmentQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<EnvironmentQueryParams>()
  const infrastructureCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)
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
  const { getString } = useStrings()
  const { CDS_INFRA_GITX } = useFeatureFlags()
  const infrastructureResponse = data?.data?.infrastructure
  const { repoName, filePath, fileUrl, branch } = get(
    infrastructureResponse,
    'entityGitDetails',
    {}
  ) as EntityGitDetails

  const onGitBranchChange = (selectedFilter: { branch: string }): void => {
    updateQueryParams({ infraBranch: selectedFilter.branch })
  }

  function handleReloadFromCache(): void {
    refetch?.({
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
  }

  const renderRemoteDetails = (): JSX.Element | null => {
    return CDS_INFRA_GITX && infraStoreType === 'REMOTE' && !loading ? (
      <div className={css.gitRemoteDetailsWrapper}>
        <GitRemoteDetails
          connectorRef={get(infrastructureResponse, 'connectorRef', infraConnectorRef)}
          repoName={defaultTo(repoName, infraRepoName)}
          filePath={filePath}
          fileUrl={fileUrl}
          branch={defaultTo(branch, infraBranch)}
          onBranchChange={onGitBranchChange}
          flags={{
            readOnly: false
          }}
        />
        {!hasRemoteFetchFailed && (
          <EntityCachedCopy
            ref={infrastructureCachedCopyRef}
            reloadContent={getString('infrastructureText')}
            cacheResponse={get(infrastructureResponse, 'cacheResponseMetadataDTO')}
            reloadFromCache={handleReloadFromCache}
          />
        )}
      </div>
    ) : null
  }

  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }}>
        {getString('cd.infrastructure.infrastructureDetails')}
        {renderRemoteDetails()}
      </Text>
      {shouldShowActionButtons && (
        <Container>
          <Layout.Horizontal
            spacing={'medium'}
            padding={{ top: 'xlarge', left: 'huge', bottom: 'large' }}
            className={css.modalFooter}
          >
            {isInfraUpdated && (
              <Button
                variation={ButtonVariation.LINK}
                intent="warning"
                className={css.tagRender}
                onClick={openUnsavedChangesDiffModal}
              >
                {getString('unsavedChanges')}
              </Button>
            )}
            <RbacButton
              text={getString('save')}
              variation={ButtonVariation.PRIMARY}
              onClick={applyChanges}
              disabled={infraSaveInProgress || !isInfraUpdated}
              loading={infraSaveInProgress}
              permission={environmentEditPermissions}
            />
            <Button
              text={getString('common.discard')}
              variation={ButtonVariation.SECONDARY}
              onClick={discardChanges}
              disabled={infraSaveInProgress}
            />
          </Layout.Horizontal>
        </Container>
      )}
    </Layout.Horizontal>
  )
}
