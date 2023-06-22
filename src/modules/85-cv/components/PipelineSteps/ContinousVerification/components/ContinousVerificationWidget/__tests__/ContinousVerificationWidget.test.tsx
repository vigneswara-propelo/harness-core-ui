/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { validateMonitoredService } from '../ContinousVerificationWidget.utils'
import {
  expectedErrorsForEmptyTemplateInputs,
  formikMockValues,
  formikMockValuesWithSimpleVerification,
  mockedTemplateInputs,
  mockedTemplateInputsToValidate
} from './ContinousVerificationWidget.mock'
import SelectVerificationType from '../components/ContinousVerificationWidgetSections/components/SelectVerificationType/SelectVerificationType'

describe('Unit tests for ContinousVerificationWidget Utils', () => {
  const type = 'Default'
  const stepViewType = StepViewType.Edit
  const monitoredServiceRef = ''
  const errors = {}
  const healthSources: any = []
  const getString = (key: string): string => key
  const monitoredServiceTemplateRef = ''
  const templateInputsToValidate = {}
  const templateInputs = {}
  const isMultiServiesOrEnvs = false

  test('if validateMonitoredService function validates the default monitored service correctly when no monitored service is present', async () => {
    const expectedErrors = {
      spec: {
        monitoredServiceRef: 'Monitored service is required'
      }
    }
    expect(
      validateMonitoredService(
        type,
        stepViewType,
        monitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        templateInputsToValidate,
        templateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrors)
  })

  test('if validateMonitoredService function validates the default monitored service correctly when monitored service is present and health source is not present', async () => {
    const newMonitoredServiceRef = 'splunk_prod'
    const expectedErrors = {
      spec: {
        healthSources: 'connectors.cdng.validations.healthSourceRequired'
      }
    }
    expect(
      validateMonitoredService(
        type,
        stepViewType,
        newMonitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        templateInputsToValidate,
        templateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrors)
  })

  test('if validateMonitoredService function validates the configured monitored service correctly when no monitored service is present', async () => {
    const newType = 'Configured'
    const expectedErrors = {
      spec: {
        monitoredService: {
          spec: {
            monitoredServiceRef: 'Monitored service is required'
          }
        }
      }
    }
    expect(
      validateMonitoredService(
        newType,
        stepViewType,
        monitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        templateInputsToValidate,
        templateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrors)
  })

  test('if validateMonitoredService function validates the configured monitored service correctly when monitored service is present and health source is not present', async () => {
    const newMonitoredServiceRef = 'splunk_prod'
    const expectedErrors = {
      spec: {
        healthSources: 'connectors.cdng.validations.healthSourceRequired'
      }
    }
    expect(
      validateMonitoredService(
        type,
        stepViewType,
        newMonitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        templateInputsToValidate,
        templateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrors)
  })

  test('if validateMonitoredService function validates the templatised monitored service correctly when template is not selected', async () => {
    const templateType = 'Template'
    const expectedErrors = {
      spec: {
        monitoredService: {
          type: 'Template Selection is required.'
        }
      }
    }
    expect(
      validateMonitoredService(
        templateType,
        stepViewType,
        monitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        templateInputsToValidate,
        templateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrors)
  })

  test('if validateMonitoredService function validates the templatised monitored service correctly templateInputs are empty', async () => {
    const templateType = 'Template'
    expect(
      validateMonitoredService(
        templateType,
        stepViewType,
        monitoredServiceRef,
        errors,
        healthSources,
        getString,
        monitoredServiceTemplateRef,
        mockedTemplateInputsToValidate,
        mockedTemplateInputs,
        isMultiServiesOrEnvs
      )
    ).toEqual(expectedErrorsForEmptyTemplateInputs)
  })

  describe('Simple verification', () => {
    test('Should not add Simple verification option if feature flag is disabled', async () => {
      render(
        <TestWrapper>
          <Formik initialValues={formikMockValues.values} onSubmit={jest.fn()}>
            <SelectVerificationType allowableTypes={[MultiTypeInputType.FIXED]} formik={formikMockValues} />
          </Formik>
        </TestWrapper>
      )

      const verificationTypeDropdownInput = document.querySelector('input[name="spec.type"]')

      expect(verificationTypeDropdownInput).toBeInTheDocument()

      await userEvent.click(verificationTypeDropdownInput!)

      expect(screen.getByText('Rolling Update')).toBeInTheDocument()
      expect(screen.queryByText('pipeline.deploymentType.thresholdAnalysis')).not.toBeInTheDocument()
    })

    test('Should show Simple verification option if feature flag is enabled', async () => {
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_SIMPLE_VERIFICATION: true }}>
          <Formik initialValues={formikMockValues.values} onSubmit={jest.fn()}>
            <SelectVerificationType allowableTypes={[MultiTypeInputType.FIXED]} formik={formikMockValues} />
          </Formik>
        </TestWrapper>
      )

      const verificationTypeDropdownInput = document.querySelector('input[name="spec.type"]')

      expect(verificationTypeDropdownInput).toBeInTheDocument()

      await userEvent.click(verificationTypeDropdownInput!)

      expect(screen.getByText('Rolling Update')).toBeInTheDocument()

      const simpleVerificationOption = screen.getByText('pipeline.deploymentType.thresholdAnalysis')

      expect(simpleVerificationOption).toBeInTheDocument()

      await userEvent.click(simpleVerificationOption)
    })

    test('Should should render the form based on the deployment type selected', async () => {
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_SIMPLE_VERIFICATION: true }}>
          <Formik initialValues={formikMockValuesWithSimpleVerification.values} onSubmit={jest.fn()}>
            <SelectVerificationType
              allowableTypes={[MultiTypeInputType.FIXED]}
              formik={formikMockValuesWithSimpleVerification}
            />
          </Formik>
        </TestWrapper>
      )

      const verificationTypeDropdownInput = document.querySelector('input[name="spec.type"]')

      expect(verificationTypeDropdownInput).toBeInTheDocument()

      await userEvent.click(verificationTypeDropdownInput!)

      expect(screen.getByText('Rolling Update')).toBeInTheDocument()

      const simpleVerificationOption = screen.getByText('pipeline.deploymentType.thresholdAnalysis')

      expect(simpleVerificationOption).toBeInTheDocument()

      await userEvent.click(simpleVerificationOption)

      await waitFor(() => expect(screen.getByTestId(/simpleVerification_form/)).toBeInTheDocument())
    })
  })
})
