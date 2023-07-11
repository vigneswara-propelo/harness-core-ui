/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { awsRegions } from '@pipeline/components/PipelineSteps/Steps/StepGroupStep/__tests__/mocks'
import type { AMIFilter } from 'services/pipeline-ng'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { AmazonMachineImage } from '../AmazonMachineImage'
import { amiTagsData } from './mocks'

const getListTagsForAmiArtifact = jest.fn(() => Promise.resolve(amiTagsData))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => ({ data: awsRegions, loading: false }))
}))

jest.mock('services/cd-ng-rq', () => ({
  useListTagsForAmiArtifactMutation: jest.fn().mockImplementation(() => ({
    data: amiTagsData,
    mutate: getListTagsForAmiArtifact,
    isLoading: false
  }))
}))

const fillMultiTypeTagSelectorData = async (
  tagKey: string,
  container: HTMLElement,
  tag: AMIFilter,
  index: number,
  addButton: HTMLElement
): Promise<void> => {
  const { name, value } = tag

  userEvent.click(addButton)

  await waitFor(() => expect(queryByNameAttribute(`${tagKey}[${index}].name`, container)).toBeInTheDocument())
  const tagName = queryByNameAttribute(`${tagKey}[${index}].name`, container) as HTMLInputElement
  await waitFor(() => expect(tagName.placeholder).toBe(''))

  userEvent.click(tagName)
  userEvent.click(await screen.findByText(name!))
  await waitFor(() => expect(tagName).toHaveValue(name))

  await userEvent.type(container.querySelector(`input[name="${tagKey}[${index}].value"]`) as HTMLInputElement, value!)
}

const tags: AMIFilter[] = [{ name: 'owner', value: '1' }]
const filters: AMIFilter[] = [{ name: 'ami-image-id', value: '1' }]

describe('AMI Artifact Trigger Test', () => {
  test('Create flow', async () => {
    const handleSubmit = jest.fn()
    const { findByText, container } = render(
      <TestWrapper>
        <AmazonMachineImage
          key=""
          name="Artifact Location"
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={{
            eventConditions: [],
            connectorRef: '',
            filters: [],
            tags: [],
            region: '',
            version: '<+trigger.artifact.build>'
          }}
          handleSubmit={handleSubmit}
        />
      </TestWrapper>
    )

    expect(await findByText('pipeline.artifactsSelection.artifactDetails')).toBeInTheDocument()
    const regionField = container.querySelector('[name="region"]') as HTMLInputElement
    expect(regionField).toHaveValue('')
    const submitButton = container.querySelector('[type="submit"]') as HTMLButtonElement

    // Error check
    userEvent.click(submitButton)
    expect(await findByText('validation.regionRequired')).toBeInTheDocument()

    // Enter region values
    userEvent.click(regionField)
    const dropDownSelectOption = await findByText('US East (N. Virginia)')

    expect(dropDownSelectOption).toBeInTheDocument()
    userEvent.click(dropDownSelectOption)

    await waitFor(() => {
      expect(queryByNameAttribute('region', container)).toHaveValue('US East (N. Virginia)')
    })

    // Enter AMI Tags
    /* const addAMITagsButton = await screen.findByText('pipeline.amiTags', { selector: 'span.bp3-button-text' })
    fillMultiTypeTagSelectorData('tags', container, tags[0], 0, addAMITagsButton)
    await waitFor(() => expect(container.querySelector(`input[name="tags[0].value"]`)).toHaveValue(tags[0].value)) */

    //  Enter AMI Filters
    const addAMIFiltersButton = await screen.findByText('pipeline.amiFilters', { selector: 'span.bp3-button-text' })
    fillMultiTypeTagSelectorData('filters', container, filters[0], 0, addAMIFiltersButton)
    await waitFor(() => expect(container.querySelector(`input[name="filters[0].value"]`)).toHaveValue(filters[0].value))

    // Submit Form
    userEvent.click(submitButton)
    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        connectorRef: 'connectorRef',
        region: 'us-east-1',
        tags: [],
        filters,
        eventConditions: [],
        version: '<+trigger.artifact.build>'
      })
    )
  })

  test('Edit flow', async () => {
    const handleSubmit = jest.fn()
    const { findByText, container } = render(
      <TestWrapper>
        <AmazonMachineImage
          key=""
          name="Artifact Location"
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={{
            eventConditions: [],
            connectorRef: 'connectorRef',
            filters,
            tags,
            region: 'us-east-1',
            version: '<+trigger.artifact.build>'
          }}
          handleSubmit={handleSubmit}
        />
      </TestWrapper>
    )

    expect(await findByText('pipeline.artifactsSelection.artifactDetails')).toBeInTheDocument()
    const regionField = container.querySelector('[name="region"]') as HTMLInputElement
    expect(regionField).toHaveValue('US East (N. Virginia)')
    const submitButton = container.querySelector('[type="submit"]') as HTMLButtonElement

    // Change region value
    userEvent.click(regionField)
    const dropDownSelectOption = await findByText('US East (Ohio)')
    expect(dropDownSelectOption).toBeInTheDocument()
    userEvent.click(dropDownSelectOption)

    // Submit form
    await userEvent.click(submitButton)

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        connectorRef: 'connectorRef',
        region: 'us-east-2',
        tags: [],
        filters,
        eventConditions: [],
        version: '<+trigger.artifact.build>'
      })
    )
  })
})
