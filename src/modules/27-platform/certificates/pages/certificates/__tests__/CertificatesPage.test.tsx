/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@modules/10-common/RouteDefinitions'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import CertificatesPage from '../CertificatesPage'

describe('Certificates Page', () => {
  test('Render account level certificates page', () => {
    const { getByText } = render(
      <TestWrapper path={routes.toCertificates({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CertificatesPage />
      </TestWrapper>
    )
    const heading = getByText('account platform.certificates.certificatesTitle')
    expect(heading).toBeInTheDocument()
  })
})
