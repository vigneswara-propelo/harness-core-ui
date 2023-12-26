/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { PageSpinner } from '@harness/uicore'
import { TemplateStudioInternal } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { TemplateProvider } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import {
  TemplateLoaderProvider,
  useTemplateLoaderContext
} from '@templates-library/common/components/TemplateStudio/TemplateLoaderContext/TemplateLoaderContext'
import { TemplateProviderY1 } from '@templates-library/y1/components/TemplateContext/TemplateContextY1'
import { TemplateStudioInternalY1 } from '@templates-library/y1/components/TemplateStudioInternal/TemplateStudioInternalY1'
import { IDBProvider } from '@modules/10-common/components/IDBContext/IDBContext'
import { YamlVersionSwitch } from '@modules/70-pipeline/components/PipelineStudio/YamlVersionSwitch'

function TemplateStudioInner(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()

  const { yamlVersion } = useTemplateLoaderContext()

  return (
    <YamlVersionSwitch
      yamlVersion={yamlVersion}
      loading={
        <React.Fragment>
          <PageSpinner />
          <div /> {/* this empty div is required for rendering layout correctly */}
        </React.Fragment>
      }
      v0={
        <TemplateProvider
          queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
          module={module}
          templateIdentifier={templateIdentifier}
          versionLabel={versionLabel}
          templateType={templateType}
        >
          <GitSyncStoreProvider>
            <TemplateStudioInternal />
          </GitSyncStoreProvider>
        </TemplateProvider>
      }
      v1={
        <TemplateProviderY1
          queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
          module={module}
          templateIdentifier={templateIdentifier}
          versionLabel={versionLabel}
          templateType={templateType}
        >
          <GitSyncStoreProvider>
            <TemplateStudioInternalY1 />
          </GitSyncStoreProvider>
        </TemplateProviderY1>
      }
    />
  )
}

export function TemplateStudio(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()

  return (
    <IDBProvider storeName="template-cache" dbName="template-db">
      <TemplateLoaderProvider
        queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
        templateIdentifier={templateIdentifier}
        versionLabel={versionLabel}
        templateType={templateType}
      >
        <TemplateStudioInner />
      </TemplateLoaderProvider>
    </IDBProvider>
  )
}
