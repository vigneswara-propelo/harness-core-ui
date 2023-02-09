/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy } from 'react'
import type { SSCSCustomMicroFrontendProps } from '@sscs/interfaces/SSCSCustomMicroFrontendProps.types'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import * as sscsService from 'services/sscs'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { Duration } from '@common/components'

// eslint-disable-next-line import/no-unresolved
const RemoteSSCSApp = lazy(() => import('sscs/MicroFrontendApp'))

export const SSCSApp = (): React.ReactElement => (
  <ChildAppMounter<SSCSCustomMicroFrontendProps>
    ChildApp={RemoteSSCSApp}
    customHooks={{ useQueryParams, useUpdateQueryParams }}
    customComponents={{ Duration }}
    services={sscsService}
  />
)
