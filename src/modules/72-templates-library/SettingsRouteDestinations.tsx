/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import {
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TemplateStudio } from './components/TemplateStudio/TemplateStudio'
import TemplatesPage from './pages/TemplatesPage/TemplatesPage'

const RedirectToNewTemplateStudio = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const queryParams = useQueryParams<TemplateStudioQueryParams>()
  return (
    <Redirect
      to={routes.toTemplateStudioNew({
        accountId,
        projectIdentifier,
        orgIdentifier,
        templateIdentifier,
        templateType,
        module,
        ...queryParams
      })}
    />
  )
}

function TemplateSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  const templatePathProps: Pick<TemplateStudioPathProps, 'templateIdentifier' | 'templateType'> = {
    templateIdentifier: ':templateIdentifier',
    templateType: ':templateType'
  }
  return (
    <Switch>
      <RouteWithContext exact path={pathArrayForAllScopes(routes.toTemplates, mode)} pageName={PAGE_NAME.TemplatesPage}>
        <TemplatesPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toTemplatestudio, mode, { ...templatePathProps })}
        pageName={PAGE_NAME.TemplatesPage}
      >
        <RedirectToNewTemplateStudio />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toTemplateStudioNew, mode, { ...templatePathProps })}
        pageName={PAGE_NAME.TemplatesPage}
      >
        <TemplateStudio />
      </RouteWithContext>
    </Switch>
  )
}

export default TemplateSettingsRouteDestinations
