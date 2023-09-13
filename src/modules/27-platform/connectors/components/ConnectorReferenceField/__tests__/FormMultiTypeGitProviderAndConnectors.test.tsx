/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { catalogueData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import { FormMultiTypeGitProviderAndConnectorField } from '../FormMultiTypeGitProviderAndConnector'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} })),
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => {
    return { data: catalogueData, loading: false }
  })
}))
jest.mock('@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook', () => ({
  useGetConnectorsListHook: jest.fn().mockReturnValue({
    loading: false,
    categoriesMap: { drawerLabel: 'Connectors', categories: [] },
    connectorsList: ['K8sCluster'],
    connectorCatalogueOrder: ['CLOUD_PROVIDER']
  })
}))
describe('FormMultiTypeConnectorField tests', () => {
  test(`intial render`, async () => {
    const { container } = render(
      <TestWrapper>
        <FormMultiTypeGitProviderAndConnectorField
          key={'Github'}
          onLoadingFinish={jest.fn()}
          name="connectorRef"
          label={'connector'}
          placeholder={`Select Connector`}
          accountIdentifier={'dummy'}
          projectIdentifier={'dummy'}
          orgIdentifier={'dummy'}
          width={400}
          multiTypeProps={{ expressions: [], allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          createNewLabel={'newConnectorLabel'}
          enableConfigureOptions={true}
          gitScope={{ repo: 'repoIdentifier', branch: 'branch', getDefaultFromOtherRepo: true }}
        />
      </TestWrapper>
    )
    const selectProvider = container.querySelector('input[name="provider"]')
    await userEvent.click(selectProvider as HTMLElement)
    const firstpopover = findPopoverContainer() as HTMLElement
    const harnessProvider = within(firstpopover).getByText('harness')
    await userEvent.click(harnessProvider as HTMLElement)
    expect(container).toMatchSnapshot()

    await userEvent.click(selectProvider as HTMLElement)
    const popover = findPopoverContainer() as HTMLElement
    const selectConnector = within(popover).getByText('common.selectOtherGitProviders')
    await userEvent.click(selectConnector as HTMLElement)
    const dialog = findDialogContainer() as HTMLElement
    const newconnect = queryByText(dialog, '+ newConnectorLabel')
    await userEvent.click(newconnect as HTMLElement)
    const newConnectorDialog = document.querySelectorAll('.bp3-dialog')[1]

    const cross = queryByText(newConnectorDialog as HTMLElement, 'cross')
    await userEvent.click(cross as HTMLElement)
    expect(document.querySelectorAll('.bp3-dialog').length).toEqual(1)
  })

  test(`renders drawer mode for addition of connectors`, async () => {
    const { container } = render(
      <TestWrapper>
        <FormMultiTypeGitProviderAndConnectorField
          key={'Github'}
          onLoadingFinish={jest.fn()}
          name="connectorRef"
          label={'connector'}
          placeholder={`Select Connector`}
          accountIdentifier={'dummy'}
          projectIdentifier={'dummy'}
          orgIdentifier={'dummy'}
          width={400}
          multiTypeProps={{ expressions: [], allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          createNewLabel={'newConnectorLabel'}
          enableConfigureOptions={true}
          gitScope={{ repo: 'repoIdentifier', branch: 'branch', getDefaultFromOtherRepo: true }}
          isDrawerMode={true}
        />
      </TestWrapper>
    )

    const selectProvider = container.querySelector('input[name="provider"]')
    await userEvent.click(selectProvider as HTMLElement)
    const popover = findPopoverContainer() as HTMLElement
    const selectConnector = within(popover).getByText('common.selectOtherGitProviders')
    await userEvent.click(selectConnector as HTMLElement)
    const dialog = findDialogContainer() as HTMLElement
    const newconnect = queryByText(dialog, '+ newConnectorLabel')
    await userEvent.click(newconnect as HTMLElement)
    const newConnectorDialog = document.querySelectorAll('.bp3-drawer')[0]
    const cross = queryByText(newConnectorDialog as HTMLElement, 'cross')
    await userEvent.click(cross as HTMLElement)
    expect(document.querySelectorAll('.bp3-drawer').length).toEqual(0)
  })
})
