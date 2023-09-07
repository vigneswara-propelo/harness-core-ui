/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Label, MultiTypeInputType, Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, waitFor, findByTestId, createEvent, screen, queryByAttribute } from '@testing-library/react'

import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'

import MultiConfigSelectField from '../MultiConfigSelectField'

jest.useFakeTimers()

const eventData = { dataTransfer: { setData: jest.fn(), dropEffect: '', getData: () => '' } }

function WrapperComponent(props: any): JSX.Element {
  const { initialValues, initialErrors, values = ['/t2confiog'] } = props || {}
  return (
    <TestWrapper>
      <Formik initialErrors={initialErrors} initialValues={initialValues} onSubmit={jest.fn()} formName="TestWrapper">
        {formikProps => {
          return (
            <FormikForm>
              <DragDropContext onDragEnd={jest.fn()}>
                <Droppable droppableId="test">
                  {provided => (
                    <div ref={provided.innerRef}>
                      <MultiConfigSelectField
                        fileUsage="CONFIG"
                        name={'files'}
                        {...formikProps}
                        {...props}
                        multiTypeFieldSelectorProps={{
                          disableTypeSelection: false,
                          label: (
                            <Label htmlFor="files">
                              {formikProps.values.fileType === FILE_TYPE_VALUES.FILE_STORE
                                ? 'File/Folder Path'
                                : 'Encrypted file(s)'}
                            </Label>
                          )
                        }}
                        values={values}
                        expressions={['org.identifier']}
                      />
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('Define Multi type config select field', () => {
  test('should render select field, with label', async () => {
    const { getByTestId } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: ['/t2confiog'],
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        values={['/t2confiog']}
        restrictToSingleEntry
      />
    )

    const fieldContainer = await getByTestId('file-store-select')
    act(() => {
      fireEvent.dragEnd(fieldContainer)
    })
    expect(fieldContainer).toBeInTheDocument()
  })
  test('should render , with runtime value', async () => {
    const { container } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: '<+input>',
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        initialErrors={{ files: 'error test' }}
        values="<+input>"
        restrictToSingleEntry
      />
    )
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_files') as HTMLElement
    expect(cogButton).toBeInTheDocument()
    act(() => {
      fireEvent.click(cogButton)
    })
    await waitFor(() => expect(modals.length).toBe(1))
    expect(container).toBeTruthy()
  })
  test('should render , encrypted field', async () => {
    const { container, getAllByTestId } = render(
      <WrapperComponent
        fileUsage="MANIFEST"
        name="files"
        initialErrors={{
          files: ['test1 error message']
        }}
        initialValues={{
          files: ['a'],
          fileType: FILE_TYPE_VALUES.ENCRYPTED
        }}
        fileType={FILE_TYPE_VALUES.ENCRYPTED}
        values={['a']}
        appearance={'minimal'}
        allowableTypes={[MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED]}
      />
    )
    const encryptedField = await getAllByTestId('files[0]')
    expect(encryptedField[0]).toBeInTheDocument()
    expect(container).toBeTruthy()
  })
  test('Add new field', async () => {
    const { container } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: ['/t2confiog'],
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        isAttachment
      />
    )
    const addBtn = await findByTestId(container, 'add-files')
    expect(addBtn).toBeInTheDocument()
  })
  test('Remove field', async () => {
    const { container } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: ['/t2confiog', '/testfile'],
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        isAttachment
        values={['/t2confiog', '/test1']}
      />
    )

    const deleteBtn = await findByTestId(container, 'remove-files-[1]')
    const addBtn = await findByTestId(container, 'add-files')
    expect(addBtn).toBeInTheDocument()
    await act(() => {
      fireEvent.click(addBtn)
    })
    expect(deleteBtn).toBeInTheDocument()
    expect(deleteBtn).toBeEnabled()
  })
  test('Update filestore field', async () => {
    const { container, getAllByRole } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: ['/t2confiog', '<+stage>'],
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        initialErrors={{ files: ['error test', 'error test2'] }}
        isAttachment
        values={['/t2confiog', '/test1']}
      />
    )

    const expressionInput = queryByAttribute('name', container, 'files[1]')
    await fireEvent.change(expressionInput!, { target: { value: '<+org.description>' } })
    const btn = getAllByRole('button')[0]

    await fireEvent.click(btn)

    await waitFor(() => expect(screen.getByText('Fixed value')).toBeInTheDocument())
    await fireEvent.click(screen.getByText('Fixed value'))

    const addLabel = await findByTestId(container, 'add-files')
    await fireEvent.click(addLabel)
    await fireEvent.click(addLabel)

    const paramOne = await findByTestId(container, 'files[0]')
    const deleteBtn = await findByTestId(container, 'remove-files-[1]')
    await fireEvent.click(deleteBtn)
    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(paramOne), eventData)

      fireEvent(paramOne, dragStartEvent)
      fireEvent.dragEnd(addLabel)
      fireEvent.dragLeave(paramOne)

      const dropEffectEvent = Object.assign(createEvent.dragOver(paramOne), eventData)
      fireEvent(addLabel, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(paramOne), eventData)
      fireEvent(addLabel, dropEvent)
    })
    expect(paramOne).toBeInTheDocument()
  })
  test('Update runtime filestore field', async () => {
    const { container, getAllByRole } = render(
      <WrapperComponent
        fileUsage="CONFIG"
        name="files"
        initialValues={{
          files: ['/test'],
          fileType: FILE_TYPE_VALUES.FILE_STORE
        }}
        values={['/test']}
      />
    )

    const multiTypeBtn = getAllByRole('button')[0]

    fireEvent.click(multiTypeBtn!)

    await waitFor(() => expect(screen.getByText('Runtime input')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Runtime input'))

    const fileInput = queryByNameAttribute('files', container) as HTMLInputElement
    expect(fileInput.value).toBe(RUNTIME_INPUT_VALUE)
  })
})
