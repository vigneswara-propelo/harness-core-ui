/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { RepositoryPortOrServer } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { Nexus3ArtifactDigestField } from '../Nexus3DigestField'

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetLastSuccessfulBuildForNexusArtifact: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Nexus 3 Digest Wrapper Component', () => {
  test('Rendering and clicking of digest component', () => {
    const initialValues = {
      values: {
        identifier: 'abc1',
        repository: 'cdp-test-group2',
        repositoryFormat: 'docker',
        artifactPath: 'artifact-path',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryPort: '4002',
        tag: 'tag',
        digest: ''
      }
    }

    const { container } = render(
      <TestWrapper>
        <Nexus3ArtifactDigestField
          formik={initialValues}
          isTagDetailsLoading={false}
          expressions={[]}
          connectorRefValue={'abcd'}
          allowableTypes={allowableTypes}
          isReadonly={false}
        />
      </TestWrapper>
    )
    const digestFieldInput = container.querySelector('input[name="digest"]')
    expect(digestFieldInput!).toBeInTheDocument()
    userEvent.click(digestFieldInput!)
  })
})
