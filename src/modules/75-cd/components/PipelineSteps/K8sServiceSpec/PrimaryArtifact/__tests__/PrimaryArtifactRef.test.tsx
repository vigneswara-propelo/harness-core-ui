/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import * as reactRouterUtils from 'react-router-dom'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceSpec, useGetArtifactSourceInputs } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageFormContext } from '@pipeline/context/StageFormContext'
import PrimaryArtifactRef from '../PrimaryArtifactRef'
import type { K8SDirectServiceStep } from '../../K8sServiceSpecInterface'
import {
  formik,
  templatewithRuntime,
  templateWithoutRuntime,
  initialValuesWithRuntime,
  initialValuesWithoutRuntime,
  stageContextValue,
  inputSetTemplate,
  inputSetFormikValues,
  inputSetInitialValues,
  inputSetFormikInitialValues
} from './mocks'

jest.fn().mockImplementation(() => {
  return { data: {}, refetch: jest.fn(), error: null, loading: false }
})
jest.mock('services/cd-ng', () => ({
  useGetArtifactSourceInputs: jest.fn(() => ({
    data: {
      data: {
        sourceIdentifiers: ['source1'],
        sourceIdentifierToSourceInputMap: {
          source1: 'identifier: "source1"\ntype: "DockerRegistry"\nspec:\n  tag: "<+input>"\n'
        }
      }
    }
  }))
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ inputSetIdentifier: '-1' })
}))

describe('Primary Artifact ref tests', () => {
  test('should render correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PrimaryArtifactRef
          serviceIdentifier="serviceTest"
          stepViewType={StepViewType.DeploymentForm}
          path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
          formik={formik as any}
          template={templatewithRuntime as ServiceSpec}
          initialValues={initialValuesWithRuntime as K8SDirectServiceStep}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('field should be populated in case of single artifact source with runtime input', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceTest"
            stepViewType={StepViewType.DeploymentForm}
            template={templatewithRuntime as ServiceSpec}
            formik={formik as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={initialValuesWithRuntime as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('[data-icon="chevron-down"]')!)
    const primaryArtifact = getByText('source1')
    await userEvent.click(primaryArtifact)
    await waitFor(() => expect(primaryArtifact).toBeInTheDocument())
    expect(stageContextValue.updateStageFormTemplate).toHaveBeenCalled()
  })

  test('field should not be auto populated in case of single artifact source for edit input set', async () => {
    jest.spyOn(reactRouterUtils, 'useParams').mockImplementation(() => {
      return { inputSetIdentifier: 'someId' } as any
    })
    const setValuesMock = jest.fn()
    const inputSetFormikMock = {
      ...formik,
      initialValues: inputSetFormikInitialValues,
      values: inputSetFormikValues,
      setValues: setValuesMock
    }
    render(
      <TestWrapper queryParams={{ inputSetIdentifier: 'someId' }}>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceTest"
            stepViewType={StepViewType.InputSet}
            template={inputSetTemplate as ServiceSpec}
            formik={inputSetFormikMock as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={inputSetInitialValues as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(setValuesMock).not.toHaveBeenCalled())
  })

  test('field should be auto populated in case of single artifact source for new input set', async () => {
    jest.spyOn(reactRouterUtils, 'useParams').mockImplementation(() => {
      return { inputSetIdentifier: '-1' } as any
    })
    const setValuesMock = jest.fn()
    const inputSetFormikMock = {
      ...formik,
      initialValues: inputSetFormikInitialValues,
      values: inputSetFormikValues,
      setValues: setValuesMock
    }
    render(
      <TestWrapper queryParams={{ inputSetIdentifier: '-1' }}>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceTest"
            stepViewType={StepViewType.InputSet}
            template={inputSetTemplate as ServiceSpec}
            formik={inputSetFormikMock as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={inputSetInitialValues as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalled()
      expect(stageContextValue.updateStageFormTemplate).toHaveBeenCalledWith(
        [{ identifier: 'source1', spec: { tag: '<+input>' }, type: 'DockerRegistry' }],
        'stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec.artifacts.primary.sources'
      )
    })
  })

  test('field should be populated in case of single artifact source without runtime input', async () => {
    ;(useGetArtifactSourceInputs as jest.Mock).mockImplementation(() => ({
      data: {
        data: {
          sourceIdentifiers: ['artifactSource'],
          sourceIdentifierToSourceInputMap: {}
        }
      }
    }))
    const { container, getByText } = render(
      <TestWrapper>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceWithoutRuntime"
            stepViewType={StepViewType.DeploymentForm}
            template={templateWithoutRuntime as any}
            formik={formik as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={initialValuesWithoutRuntime as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    await userEvent.click(container.querySelector('[data-icon="chevron-down"]')!)
    await userEvent.click(getByText('artifactSource'))

    expect(stageContextValue.updateStageFormTemplate).toHaveBeenCalled()
  })
})
