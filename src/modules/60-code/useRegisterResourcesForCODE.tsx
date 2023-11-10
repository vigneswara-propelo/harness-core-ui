/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect } from 'react'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { String as LocaleString } from 'framework/strings'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RepositoryResourceModal from './components/ResourceGroupModal/Repository/RepositoryResourceModalBody'
import RepositoryResourceRenderer from './components/ResourceGroupModal/Repository/RepositoryResourceRenderer'

export function useRegisterResourcesForCODE(): void {
  const isCODEEnabled = useFeatureFlag(FeatureFlag.CODE_ENABLED)

  useEffect(() => {
    if (isCODEEnabled) {
      RbacFactory.registerResourceCategory(ResourceCategory.CODE, {
        icon: 'code',
        label: 'common.purpose.code.name'
      })

      RbacFactory.registerResourceTypeHandler(ResourceType.CODE_REPOSITORY, {
        icon: 'code',
        label: 'repository',
        labelSingular: 'repository',
        category: ResourceCategory.CODE,

        permissionLabels: {
          [PermissionIdentifier.CODE_REPO_VIEW]: <LocaleString stringID="rbac.permissionLabels.view" />,
          [PermissionIdentifier.CODE_REPO_EDIT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
          [PermissionIdentifier.CODE_REPO_DELETE]: <LocaleString stringID="delete" />,
          [PermissionIdentifier.CODE_REPO_PUSH]: <LocaleString stringID="rbac.permissionLabels.push" />
        },
        addResourceModalBody: props => <RepositoryResourceModal {...props} />,
        staticResourceRenderer: props => <RepositoryResourceRenderer {...props} />
      })
    }
  }, [isCODEEnabled])
}
