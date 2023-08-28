/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// Inspired by src/modules/70-pipeline/components/Notifications/__tests__/NotificationTable.test.tsx

import React from 'react'
import { act, fireEvent, render, RenderResult } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import SRMNotificationTable from '../SRMNotificationTable'
import type { SRMNotificationTableProps } from '../SRMNotificationTable.types'
import ConfigureMonitoredServiceAlertConditions from '../../ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions'

const args: SRMNotificationTableProps = {
  data: [
    {
      notificationRule: {
        orgIdentifier: 'test_org',
        projectIdentifier: 'test_project',
        identifier: 'NotificationRule',
        name: 'NotificationRule',
        type: 'MonitoredService',
        conditions: [
          {
            type: 'ChangeImpact',
            spec: {
              changeCategories: ['Infrastructure', 'Alert'],
              threshold: 33,
              period: '60m'
            }
          },
          {
            type: 'HealthScore',
            spec: {
              threshold: 66,
              period: '120m'
            }
          },
          {
            type: 'ChangeObserved',
            spec: {
              changeCategories: ['Infrastructure', 'Alert']
            }
          },
          {
            type: 'CodeErrors',
            spec: {
              errorTrackingEventTypes: ['Exceptions', 'LogErrors'],
              errorTrackingEventStatus: ['NewEvents', 'CriticalEvents', 'ResurfacedEvents']
            }
          }
        ],
        notificationMethod: {
          type: 'Email',
          spec: {
            recipients: ['email@harness.io']
          }
        }
      },
      enabled: true,
      createdAt: 1672063927547,
      lastModifiedAt: 1672076976438
    }
  ],
  gotoPage: jest.fn(),
  onUpdate: jest.fn(),
  totalPages: 1,
  totalItems: 1,
  pageItemCount: 1,
  pageSize: 1,
  pageIndex: 0,
  notificationRulesComponent: <ConfigureMonitoredServiceAlertConditions name={'Conditions'} />,
  handleDeleteNotification: jest.fn(),
  handleCreateNotification: jest.fn(),
  handleToggleNotification: jest.fn()
}

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(3)
  }
})

describe('Notification Table test', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <SRMNotificationTable {...args} />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
  })

  test('render', () => {
    expect(container).toMatchSnapshot()
  })

  test('Delete Notfication', async () => {
    const menu = container.querySelector(`[data-icon="Options"]`)
    fireEvent.click(menu!)
    const deleteMenu = getByText('delete')
    expect(deleteMenu).toBeDefined()
    await act(async () => {
      fireEvent.click(deleteMenu!)
    })
  })

  test('New Notfication', async () => {
    const addNotification = getByText('rbac.notifications.name')
    await act(async () => {
      fireEvent.click(addNotification!)
    })
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    fireEvent.click(form?.querySelector('[icon="cross"]')!)
    form = findDialogContainer()
    expect(form).not.toBeTruthy()
  })
})
