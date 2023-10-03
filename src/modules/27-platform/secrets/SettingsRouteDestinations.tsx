/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes, secretPathProps } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import SecretsPage from './pages/secrets/SecretsPage'
import CreateSecretFromYamlPage from './pages/createSecretFromYaml/CreateSecretFromYamlPage'
import SecretDetails from './pages/secretDetails/SecretDetails'
import SecretDetailsHomePage from './pages/secretDetailsHomePage/SecretDetailsHomePage'
import SecretReferences from './pages/secretReferences/SecretReferences'

function RedirectToSecretDetailHome({ mode }: { mode: NAV_MODE }): JSX.Element {
  const { secretId, module, ...rest } = useParams<ProjectPathProps & SecretsPathProps & ModulePathParams>()
  return <Redirect to={routes.toSecretDetailsOverviewSettings({ ...rest, mode, secretId, module })} />
}

function SecretSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSecretsSettings, mode)}
        pageName={PAGE_NAME.SecretsPage}
      >
        <SecretsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toCreateSecretFromYamlSettings, mode)}
        pageName={PAGE_NAME.CreateSecretFromYamlPage}
      >
        <CreateSecretFromYamlPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[...pathArrayForAllScopes(routes.toSecretDetailsSettings, mode, { ...secretPathProps })]}
        pageName={PAGE_NAME.SecretDetails}
      >
        <RedirectToSecretDetailHome mode={mode} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          ...pathArrayForAllScopes(routes.toSecretDetailsSettings, mode, { ...secretPathProps }),
          ...pathArrayForAllScopes(routes.toSecretDetailsOverviewSettings, mode, { ...secretPathProps })
        ]}
        pageName={PAGE_NAME.SecretDetails}
      >
        <SecretDetailsHomePage>
          <SecretDetails />
        </SecretDetailsHomePage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toSecretDetailsReferencesSettings, mode, { ...secretPathProps })}
      >
        <SecretDetailsHomePage>
          <SecretReferences />
        </SecretDetailsHomePage>
      </RouteWithContext>
    </>
  )
}

export default SecretSettingsRouteDestinations
