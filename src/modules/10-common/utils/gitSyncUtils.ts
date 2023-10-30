/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { GitSyncConfig } from 'services/cd-ng'
import type { EntitySelectionGitData, StoreMetadata } from '@common/constants/GitSyncTypes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { GetTemplateQueryParams } from 'services/template-ng'
import { folderPathName, yamlFileExtension } from './StringUtils'

export const defaultGitContextBranchPlaceholder = '__DEFAULT__'

export const getRepoDetailsByIndentifier = (identifier: string | undefined, repos: GitSyncConfig[]) => {
  return repos.find((repo: GitSyncConfig) => repo.identifier === identifier)
}

export const validateFilePath = (filePath: string): boolean => {
  if (!filePath.endsWith(yamlFileExtension)) {
    return false
  } else {
    const fullPath = filePath.slice(0, filePath.length - yamlFileExtension.length)
    const subPaths = fullPath.split('/')
    return subPaths.every((folderName: string) => {
      return folderName.length && folderName.match(folderPathName)?.length
    })
  }
}

export const getGitQueryParamsWithParentScope = ({
  storeMetadata,
  params,
  repoIdentifier,
  branch,
  loadFromFallbackBranch = false,
  sendParentEntityDetails = true
}: {
  storeMetadata: StoreMetadata | undefined
  params: ProjectPathProps
  repoIdentifier?: string
  branch?: string
  loadFromFallbackBranch?: boolean
  sendParentEntityDetails?: boolean
}): Partial<GetTemplateQueryParams> => {
  const parentEntityIds = {
    parentEntityAccountIdentifier: params.accountId,
    parentEntityOrgIdentifier: params.orgIdentifier,
    parentEntityProjectIdentifier: params.projectIdentifier
  }
  const branchParam = branch || storeMetadata?.branch
  return {
    getDefaultFromOtherRepo: true,

    // Gitsync uses repoIdentifier
    repoIdentifier,
    branch: branchParam,

    // Git experience uses storeMetadata
    ...(sendParentEntityDetails
      ? { parentEntityConnectorRef: storeMetadata?.connectorRef, parentEntityRepoName: storeMetadata?.repoName }
      : {}),
    ...(!isEmpty(storeMetadata?.connectorRef) && sendParentEntityDetails ? parentEntityIds : {}),
    ...(!branchParam && loadFromFallbackBranch && { loadFromFallbackBranch })
  }
}

export function isSameRepoSameBranch(
  parentGitData: EntitySelectionGitData,
  childGitData: EntitySelectionGitData
): boolean {
  return parentGitData?.repoName === childGitData?.repoName && parentGitData?.branch === childGitData?.branch
}

export function isOtherRepoDefaultBranch(
  parentGitData: EntitySelectionGitData,
  childGitData: EntitySelectionGitData
): boolean {
  return parentGitData?.repoName !== childGitData?.repoName && Boolean(childGitData?.isDefaultSelected)
}

/**
 * This util can be used for dynamic/static linking of child entitty
 * By default dynamic linkling is preperred and implemented
 * @param parentGitData
 * @param childGitData
 * @returns
 */
export function checkAndGetGitBranchForChildEntity(
  parentGitData: EntitySelectionGitData,
  childGitData: EntitySelectionGitData
): { gitBranch?: string } {
  if (
    childGitData?.branch &&
    ((!isSameRepoSameBranch(parentGitData, childGitData) && !isOtherRepoDefaultBranch(parentGitData, childGitData)) ||
      !childGitData?.repoName)
  ) {
    return { gitBranch: childGitData?.branch }
  } else {
    return {}
  }
}
