/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import EditableRow from '@cd/components/ServiceOverrides/components/ListRows/Editable/EditableRow'
import { OverrideDetails } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'

const mockOverrideDetails = {
  identifier: 'Envtest',
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  orgIdentifier: 'default',
  projectIdentifier: 'KanikaTest',
  environmentRef: 'Envtest',
  type: 'ENV_GLOBAL_OVERRIDE',
  newlyCreated: false,
  overrideType: 'manifestoverride',
  manifestValue: {
    manifest: {
      identifier: 'somemani',
      type: 'Values',
      spec: {
        store: {
          spec: {
            connectorRef: '<+input>',
            gitFetchType: 'Branch',
            branch: 'branch',
            paths: '<+input>',
            repoName: 'somerepo'
          },
          type: 'Git'
        }
      }
    }
  }
}

describe('Editable Row test cases', () => {
  test('should render override details correctly', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toServiceOverrides({
          ...projectPathProps,
          ...modulePathProps
        })}
        pathParams={{
          accountId: 'dummyAcc',
          orgIdentifier: 'dummyOrg',
          projectIdentifier: 'dummyProject',
          module: 'cd'
        }}
        queryParams={{
          serviceOverrideType: 'ENV_GLOBAL_OVERRIDE'
        }}
      >
        <EditableRow
          rowIndex={1}
          overrideDetails={mockOverrideDetails as OverrideDetails}
          isEdit={true}
          isClone={false}
        />
      </TestWrapper>
    )

    const editBtn = container.querySelector('[data-icon="Edit"]')
    fireEvent.click(editBtn!)
    await waitFor(() => expect(getByText('somemani')).toBeDefined())
  })

  test('should not break when override details are falsy', async () => {
    const emptyOverrideDetailsMock = {} as any
    render(
      <TestWrapper
        path={routes.toServiceOverrides({
          ...projectPathProps,
          ...modulePathProps
        })}
        pathParams={{
          accountId: 'dummyAcc',
          orgIdentifier: 'dummyOrg',
          projectIdentifier: 'dummyProject',
          module: 'cd'
        }}
        queryParams={{
          serviceOverrideType: 'ENV_GLOBAL_OVERRIDE'
        }}
      >
        <EditableRow rowIndex={1} overrideDetails={emptyOverrideDetailsMock} isEdit={true} isClone={false} />
      </TestWrapper>
    )
    const placeholder = await screen.findByText('common.entityPlaceholderText')
    expect(placeholder).toBeInTheDocument()
  })
})
