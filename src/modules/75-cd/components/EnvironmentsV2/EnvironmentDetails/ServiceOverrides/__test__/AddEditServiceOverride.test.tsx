/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cdNgServices from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import AddEditServiceOverride from '../AddEditServiceOverride'
import mockServiceList from './__mocks__/mockServicesListForOverrides.json'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useUpsertServiceOverride: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      mutate: jest.fn().mockResolvedValue({}),
      cancel: jest.fn(),
      error: null
    }
  }),
  useGetService: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  getServiceAccessListPromise: jest.fn().mockImplementation(() => Promise.resolve(mockServiceList))
}))

describe('Add Edit Service Override Test', () => {
  test('add new service override', async () => {
    jest.spyOn(cdNgServices, 'useUpsertServiceOverride')

    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <AddEditServiceOverride
          defaultTab="variableoverride"
          closeModal={jest.fn()}
          expressions={['']}
          selectedService={null}
          isReadonly={false}
          services={[]}
        />
      </TestWrapper>
    )

    await userEvent.click(getByTestId('cr-field-serviceRef') as HTMLElement)

    const serviceText = screen.getByText('custom test')
    expect(serviceText).toBeInTheDocument()

    await userEvent.click(serviceText)
    await userEvent.click(screen.getByText('entityReference.apply')!)
    await userEvent.click(screen.getByText('variableLabel'))

    const newOverrideText = screen.getByText('common.newName common.override')
    expect(newOverrideText).toBeDefined()
    await userEvent.click(newOverrideText)

    // select variable
    const selectBoxes = screen.getAllByPlaceholderText('- common.selectName -')
    const variableTextBox = selectBoxes[0]
    await userEvent.type(variableTextBox, 'var2')
    await userEvent.click(container.querySelector('[data-icon="plus"]') as HTMLElement)
    await waitFor(() => {
      expect(screen.queryByText('var2')).toBeInTheDocument()
    })

    await waitFor(async () => {
      const inputs = (await screen.queryAllByRole('textbox')) as HTMLElement[]
      const overrideValueInput = inputs[inputs.length - 1]

      expect(overrideValueInput).toBeDefined()
      await fireEvent.change(overrideValueInput, {
        target: { value: 'testStr' }
      })
    })

    await act(async () => {
      userEvent.click(screen.getByText('submit'))
    })

    await userEvent.click(screen.getAllByRole('button')[1])
    await waitFor(() => {
      expect(screen.getAllByRole('button')[1]).toHaveClass('PillToggle--item PillToggle--selected')
    })

    await userEvent.click(screen.getAllByRole('button')[0])
    await waitFor(() => {
      expect(screen.getAllByRole('button')[0]).toHaveClass('PillToggle--item PillToggle--selected')
    })

    expect(container).toMatchSnapshot()
  })
})
