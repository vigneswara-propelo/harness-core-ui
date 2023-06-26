/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { Segment } from 'services/cf'
import SpecifyIndividualTargets, { SpecifyIndividualTargetsProps } from '../SpecifyIndividualTargets'

const renderComponent = (props: Partial<SpecifyIndividualTargetsProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: 'Target_Group_1'
      }}
      queryParams={{ environment: 'env' }}
    >
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <SpecifyIndividualTargets targetGroup={{ environment: 'env' } as Segment} {...props} />
      </Formik>
    </TestWrapper>
  )

describe('SpecifyIndividualTargets', () => {
  test('it should display the heading and target selects', async () => {
    renderComponent()

    expect(screen.getByText('cf.segmentDetail.specifyIndividualTargets')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.includeTheFollowing:')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.excludeTheFollowing:')).toBeInTheDocument()
  })
})
