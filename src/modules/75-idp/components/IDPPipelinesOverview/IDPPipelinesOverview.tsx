/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@modules/45-projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import type { Project } from 'services/cd-ng'
import routes from '@modules/10-common/RouteDefinitionsV2'
import { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import bgImageURL from './images/bgImage.svg'

function IDPPipelinesOverview(): React.ReactElement {
  const module: Module = 'idp-admin'
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const history = useHistory()

  /* istanbul ignore next */
  const projectCreateSuccessHandler = (project?: Project): void => {
    if (project) {
      history.push(
        routes.toPipelines({
          accountId,
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier,
          module
        })
      )
    }
  }

  return (
    <HomePageTemplate
      title={getString('common.purpose.idp.fullName')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('idp.homepage.idpOverviewDescription')}
      documentText={getString('idp.homepage.learnMore')}
      documentURL={'https://developer.harness.io/docs/internal-developer-portal'}
    />
  )
}

export default IDPPipelinesOverview
