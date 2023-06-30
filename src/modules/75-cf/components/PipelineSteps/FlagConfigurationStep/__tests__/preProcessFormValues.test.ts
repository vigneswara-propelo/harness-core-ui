/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, omit } from 'lodash-es'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import preProcessFormValues from '../preProcessFormValues'
import {
  mockCompleteInstruction,
  mockFeatures,
  mockIncompleteInstruction,
  mockInitialValues,
  mockNonPercentageRolloutInstruction
} from './stepData.mock'

describe('preProcessFormValues', () => {
  describe('percentage rollout', () => {
    const projectIdentifier = 'projId'
    const orgIdentifier = 'orgId'
    describe('noop', () => {
      test('it should preform no actions when there are no instructions', async () => {
        const initialValues = omit(mockInitialValues, 'spec.instructions')

        expect(preProcessFormValues(cloneDeep(initialValues), mockFeatures, projectIdentifier, orgIdentifier)).toEqual(
          initialValues
        )
      })

      test('it should preform no actions when there are no features', async () => {
        const initialValues = mockInitialValues

        expect(preProcessFormValues(cloneDeep(initialValues), null, projectIdentifier, orgIdentifier)).toEqual(
          initialValues
        )
      })

      test('it should preform no actions when there is no matching feature', async () => {
        const initialValues = mockInitialValues
        const features = cloneDeep(mockFeatures)
        features.features?.shift()

        expect(preProcessFormValues(cloneDeep(initialValues), features, projectIdentifier, orgIdentifier)).toEqual(
          initialValues
        )
      })

      test('it should preform no actions when the instruction contains all variations in the correct order', async () => {
        const initialValues = mockInitialValues

        expect(preProcessFormValues(cloneDeep(initialValues), mockFeatures, projectIdentifier, orgIdentifier)).toEqual(
          initialValues
        )
      })

      test("it should preform no action when the instruction isn't a percentage rollout instruction", async () => {
        const initialValues = omit(mockInitialValues, 'spec.instructions')
        initialValues.spec.instructions = [mockNonPercentageRolloutInstruction]

        expect(preProcessFormValues(cloneDeep(initialValues), mockFeatures, projectIdentifier, orgIdentifier)).toEqual(
          initialValues
        )
      })
    })

    test('it should add missing variations with a 0 weight', async () => {
      const initialValues = omit(mockInitialValues, 'spec.instructions')
      initialValues.spec.instructions = [mockIncompleteInstruction]

      const response = preProcessFormValues(cloneDeep(initialValues), mockFeatures, projectIdentifier, orgIdentifier)

      expect(response).not.toEqual(initialValues)
      expect(response.spec.instructions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            spec: expect.objectContaining({
              distribution: expect.objectContaining({
                variations: expect.arrayContaining([
                  {
                    variation: 'v3',
                    weight: 0
                  }
                ])
              })
            })
          })
        ])
      )
    })

    test('it should reorder variations into the correct order', async () => {
      const initialValues = omit(mockInitialValues, 'spec.instructions')
      const instruction = cloneDeep(mockCompleteInstruction)

      // move last variation to first
      instruction.spec.distribution.variations.unshift(instruction.spec.distribution.variations.pop())

      initialValues.spec.instructions = [instruction]

      const response = preProcessFormValues(cloneDeep(initialValues), mockFeatures, projectIdentifier, orgIdentifier)

      expect(response).not.toEqual(initialValues)
      expect(response.spec.instructions).toEqual(expect.arrayContaining([mockCompleteInstruction]))
    })

    test('it should display the instructions as runtime input value if there is no project or org id', async () => {
      const initialValues = omit(mockInitialValues, 'spec.instructions')

      const response = preProcessFormValues(cloneDeep(initialValues), mockFeatures)
      expect(response.spec.instructions).not.toEqual(expect.arrayContaining([mockCompleteInstruction]))
      expect(response.spec.instructions).toEqual(RUNTIME_INPUT_VALUE)
    })
  })
})
