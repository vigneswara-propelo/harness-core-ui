/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { HomePageTemplate } from '@modules/45-projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import IDPPipelinesOverview from '../IDPPipelinesOverview'

const openProjectModalMock = jest.fn()
jest.mock('@projects-orgs/modals/ProjectModal/useProjectModal', () => ({
  useProjectModal: () => ({ openProjectModal: openProjectModalMock, closeProjectModal: jest.fn() })
}))

const props = {
  title: 'title',
  bgImageUrl: '',
  subTitle: 'subTitle',
  documentText: 'documentText',
  documentURL: 'https://docs.harness.io/',
  projectCreateSuccessHandler: jest.fn()
}
describe('HomePageTemplate', () => {
  test('should render', () => {
    const { getByText } = render(
      <TestWrapper>
        <IDPPipelinesOverview />
      </TestWrapper>
    )
    expect(getByText('common.purpose.idp.fullName')).toBeInTheDocument()
    expect(getByText('idp.homepage.idpOverviewDescription')).toBeInTheDocument()
    expect(getByText('idp.homepage.learnMore')).toBeInTheDocument()
    expect(getByText('createProject')).toBeInTheDocument()
  })

  test('should open project modal when click create project', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HomePageTemplate {...props} />
      </TestWrapper>
    )
    fireEvent.click(getByText('createProject'))
    await waitFor(() => {
      expect(openProjectModalMock).toHaveBeenCalled()
    })
  })
})
