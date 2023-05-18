/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CustomSequenceList } from '../CustomSequenceList'
import { entityDetailsMock } from './customSeqMocks'

jest.mock('react-beautiful-dnd', () => {
  return {
    // eslint-disable-next-line
    // @ts-ignore
    Draggable: props => props.children({ draggableProps: {}, dragHandleProps: {} })
  }
})

describe('CustomSequence list tests', () => {
  test('render row with EnvGroup', () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <CustomSequenceList index={0} entityDetails={entityDetailsMock[0]} listItemKey="envGroup_EnvGroup_0" />
      </TestWrapper>
    )
    //name
    expect(queryByText('envGroup')).toBeInTheDocument()

    // Env group label
    expect(queryByText('pipeline.verification.tableHeaders.group')).toBeInTheDocument()

    // multiple Env Types
    expect(queryByText('cd.preProductionType')).toBeInTheDocument()
    expect(queryByText('cd.serviceDashboard.prod')).toBeInTheDocument()

    //draggable icon
    expect(container.querySelector('[data-icon="drag-handle-vertical"]')).toBeTruthy()
  })

  test('render row with single env and newly added label', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CustomSequenceList index={1} entityDetails={entityDetailsMock[1]} listItemKey="testEnvProd_Env_1" />
      </TestWrapper>
    )
    //name
    expect(queryByText('testEnv-Prod')).toBeInTheDocument()

    // single env type
    expect(queryByText('cd.serviceDashboard.prod')).toBeInTheDocument()

    //newly added label
    expect(queryByText('cd.customSequence.newlyAddedLabel')).toBeInTheDocument()
  })

  test('render row with invalid values', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CustomSequenceList index={0} entityDetails={entityDetailsMock[2]} listItemKey={'undefined'} />
      </TestWrapper>
    )
    expect(queryByText('--')).toBeInTheDocument()
  })
})
