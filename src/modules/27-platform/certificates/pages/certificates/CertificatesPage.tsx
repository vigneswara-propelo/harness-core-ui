/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

const CertificatesPage: React.FC<Record<string, unknown>> = () => {
  const { getString } = useStrings()
  const {
    accountId,
    orgIdentifier,
    projectIdentifier
    // module
  } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: getString('platform.certificates.certificatesTitle'),
              [Scope.ORG]: getString('platform.certificates.certificatesTitle'),
              [Scope.ACCOUNT]: getString('platform.certificates.certificatesTitle')
            }}
          />
        }
      />
      <Page.Body></Page.Body>
    </>
  )
}

export default CertificatesPage
