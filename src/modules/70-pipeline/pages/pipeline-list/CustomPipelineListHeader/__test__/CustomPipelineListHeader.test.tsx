/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import CustomPipelineListHeader from '../CustomPipelineListHeader'

describe('IDP Pipeline List Header', () => {
  test('component renders correctly ', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper
        path={routes.toIDPPipelines({ ...projectPathProps, ...accountPathProps, ...orgPathProps })}
        pathParams={{
          accountId: 'accountId',
          projectIdentifier: 'project_ID',
          orgIdentifier: 'orgID'
        }}
      >
        <CustomPipelineListHeader />
      </TestWrapper>
    )
    expect(getByText('pipelines')).toBeInTheDocument()
    const projectLabel = getByText('projectLabel:')
    expect(projectLabel).toBeInTheDocument()
    const projectLink = container.querySelector<HTMLAnchorElement>('a')

    expect(projectLink).toBeInTheDocument()
    expect(projectLink?.getAttribute('href')).toEqual('/account/accountId/home/orgs/orgID/projects/project_ID/details')
    await userEvent.click(projectLink!)
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/accountId/home/orgs/orgID/projects/project_ID/details
      </div>
    `)
  })
})
