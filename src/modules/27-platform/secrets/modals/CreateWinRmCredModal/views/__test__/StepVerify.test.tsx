/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit } from '@common/utils/JestFormHelper'
import type { WinRmAuthDTO } from 'services/cd-ng'
import StepVerify from '@secrets/modals/CreateSSHCredModal/views/StepVerify'

const prevStepData: any = {
  detailsData: {
    name: '',
    identifier: ''
  },
  authData: {
    domain: '',
    authScheme: 'NTLM' as WinRmAuthDTO['type'],
    tgtGenerationMethod: 'None',
    username: '',
    port: 22,
    principal: '',
    realm: '',
    password: {
      name: '',
      identifier: '',
      referenceString: ''
    },
    keyPath: '',
    useSSL: false,
    skipCertChecks: false,
    useNoProfile: false
  }
}

describe('Create WinRm Cred Wizard Step Verify', () => {
  test('Test for winrm step verify', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <StepVerify prevStepData={prevStepData} name="sample-name" type={'WinRmCredentials'} />
      </TestWrapper>
    )

    await act(async () => {
      clickSubmit(container)
    })
    const titleStep = await findByText('platform.secrets.createSSHCredWizard.hostnameInfo')
    expect(titleStep).toBeInTheDocument() // Form validation for all required fields in step one
  })
})
