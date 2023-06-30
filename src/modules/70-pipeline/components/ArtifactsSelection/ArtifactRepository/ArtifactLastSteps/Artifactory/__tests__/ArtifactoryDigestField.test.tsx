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
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactoryArtifactDigestField } from '../ArtifactoryDigestField'

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetLastSuccessfulBuildForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Artifactory Digest Wrapper Component', () => {
  test('Rendering and clicking of digest component', () => {
    const initialValues = {
      values: {
        identifier: 'abc1',
        artifactPath: 'nexus-imagepath',
        tagType: TagTypes.Value,
        tag: 'tag',
        tagRegex: '',
        repository: 'repository-name',
        repositoryUrl: 'repositoryUrl',
        digest: ''
      }
    }

    const { container } = render(
      <TestWrapper>
        <ArtifactoryArtifactDigestField
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
