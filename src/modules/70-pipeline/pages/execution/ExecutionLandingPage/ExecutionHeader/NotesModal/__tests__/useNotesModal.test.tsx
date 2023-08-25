/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import * as usePermission from '@rbac/hooks/usePermission'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { useNotesModal } from '../useNotesModal'

jest.mock('services/pipeline-ng', () => ({
  useGetNotesForExecution: jest.fn().mockImplementation(() => {
    return {
      data: {
        status: 'SUCCESS',
        data: {
          notes: 'Sample description for execution'
        }
      },
      refetch: jest.fn(),
      loading: false
    }
  }),
  useUpdateNotesForExecution: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          status: 'SUCCESS',
          data: {
            notes: 'Updated notes'
          }
        })
    }
  })
}))

function WrapperComponent(): React.ReactElement {
  const { onClick, updateNotes, notes } = useNotesModal({
    planExecutionId: 'executionId',
    pipelineExecutionSummary: {
      name: 'pipelineIdentifier',
      pipelineIdentifier: 'pipelineIdentifier',
      runSequence: 1000
    }
  })

  const onBtnClick = (): void => {
    onClick(true)
  }
  const onUpdate = (): void => {
    updateNotes('Aborted pipeline note')
  }

  return (
    <>
      <button className="openModal" onClick={onBtnClick} />
      <button className="updateNotesModal" onClick={onUpdate} />
      <div className="notesContent">{notes}</div>
    </>
  )
}

describe('useNotesModal test', () => {
  test('render dialog with NotesModalForm - assert update and discard and close modal', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
    const { container, getByText, getByTestId, findByText } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )

    const openModal = container.querySelector('.openModal')
    await fireEvent.click(openModal!)
    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    // Assert modal and modal close on successfull save
    expect(getByText('pipelineIdentifier')).toBeDefined()
    expect(getByText('execution.pipelineIdentifierTextCD')).toBeDefined()
    const textarea = getByTestId('note-input') as HTMLTextAreaElement
    expect(textarea.value).toBe('Sample description for execution')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    expect(textarea.value).toBe('Updated notes')

    // Apply button - update the notes
    await fireEvent.click(getByText('common.apply'))

    await findByText('pipeline.executionNotes.noteSaved')

    const closeDialog = findDialogContainer()
    expect(closeDialog).toBeFalsy()

    // Assert modal and note discard
    await fireEvent.click(openModal!)

    fireEvent.change(getByTestId('note-input') as HTMLTextAreaElement, {
      target: { value: 'Updated notes to be discarded' }
    })
    // Discard button - reset the notes
    fireEvent.click(getByText('cancel'))
    expect(textarea.value).toBe('Updated notes')
  })

  test('useNotesModal - updateNotes', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )

    const notesContent = container.querySelector('.notesContent')
    expect(notesContent).toHaveTextContent('Sample description for execution')
    const updateModal = container.querySelector('.updateNotesModal')
    fireEvent.click(updateModal!)
    await findByText('pipeline.executionNotes.noteSaved')
    expect(notesContent).toHaveTextContent('Updated notes')
  })

  test('NotesModalForm - disabled for incorrect permissions', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false])
    const { container, getByTestId, debug } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )

    const openModal = container.querySelector('.openModal')
    await fireEvent.click(openModal!)
    const textarea = getByTestId('note-input') as HTMLTextAreaElement
    debug(textarea)
    expect(textarea).toHaveAttribute('placeholder', 'pipeline.executionNotes.addNote ')
    expect(textarea).toHaveAttribute('disabled')
  })
})
