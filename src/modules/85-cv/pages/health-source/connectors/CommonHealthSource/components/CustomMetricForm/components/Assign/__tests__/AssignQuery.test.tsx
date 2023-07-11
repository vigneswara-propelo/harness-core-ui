/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as formik from 'formik'
import { Formik } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import AssignQuery from '../AssignQuery'
import { assignSectionConfig, parentFormikValuesMock, riskProfileResponse } from './AssignQuery.mock'
import CommonHealthSourceProvider from '../../CommonHealthSourceContext/CommonHealthSourceContext'
import { healthSourceConfigMock } from '../components/RiskProfile/tests/RiskProfile.mock'

const WrapperComponent = ({ children }: { children: JSX.Element }) => {
  return (
    <TestWrapper>
      <CommonHealthSourceProvider updateParentFormik={jest.fn()} parentFormValues={{} as any}>
        {children}
      </CommonHealthSourceProvider>
    </TestWrapper>
  )
}
describe('Validate AssignQuery', () => {
  test('should render RiskProfile when continuousVerification and healthScore are true', () => {
    const { container, getByText } = render(
      <WrapperComponent>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <AssignQuery
            values={{ continuousVerification: true, healthScore: true, sli: false }}
            recordProps={{
              sampleRecords: []
            }}
            filterRemovedMetricNameThresholds={jest.fn()}
            riskProfileResponse={riskProfileResponse as any}
            healthSourceConfig={healthSourceConfigMock}
          />
        </Formik>
      </WrapperComponent>
    )
    expect(container.querySelector('input[name="sli"')).not.toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).toBeChecked()
    expect(getByText('cv.monitoringSources.riskCategoryLabel')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.serviceInstanceIdentifier')).toBeInTheDocument()
  })

  test('should render form errors', () => {
    jest.spyOn(formik, 'useFormikContext').mockReturnValue({
      errors: {
        [CustomMetricFormFieldNames.SLI]: 'SLI Error',
        [CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION]: 'Deviation Error',
        [CustomMetricFormFieldNames.RISK_CATEGORY]: 'Risk category Error'
      },
      touched: {
        [CustomMetricFormFieldNames.SLI]: true,
        [CustomMetricFormFieldNames.RISK_CATEGORY]: true,
        [CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION]: true
      },
      values: {},
      setFieldValue: jest.fn()
    } as unknown as any)
    const { container, getByText } = render(
      <WrapperComponent>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <AssignQuery
            values={{ continuousVerification: true, healthScore: true, sli: false }}
            filterRemovedMetricNameThresholds={jest.fn()}
            riskProfileResponse={riskProfileResponse as any}
            healthSourceConfig={healthSourceConfigMock}
            recordProps={{
              sampleRecords: []
            }}
          />
        </Formik>
      </WrapperComponent>
    )
    expect(getByText('SLI Error')).toBeInTheDocument()
    expect(getByText('Deviation Error')).toBeInTheDocument()
    expect(getByText('Risk category Error')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render RiskProfile when continuousVerification and healthScore are true with empty riskProfileResponse', () => {
    const { container, getByText, rerender } = render(
      <WrapperComponent>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <AssignQuery
            values={{ continuousVerification: true, healthScore: true, sli: false }}
            filterRemovedMetricNameThresholds={jest.fn()}
            riskProfileResponse={[] as any}
            healthSourceConfig={healthSourceConfigMock}
            recordProps={{
              sampleRecords: []
            }}
          />
        </Formik>
      </WrapperComponent>
    )
    expect(container.querySelector('input[name="sli"')).not.toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).toBeChecked()
    expect(getByText('cv.monitoringSources.serviceInstanceIdentifier')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    rerender(
      <WrapperComponent>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <AssignQuery
            values={{ continuousVerification: true, healthScore: true, sli: false }}
            filterRemovedMetricNameThresholds={jest.fn()}
            healthSourceConfig={healthSourceConfigMock}
            recordProps={{
              sampleRecords: []
            }}
          />
        </Formik>
      </WrapperComponent>
    )
  })

  test('should not render RiskProfile when continuousVerification and healthScore are false', () => {
    const { container } = render(
      <WrapperComponent>
        <Formik
          initialValues={{ continuousVerification: false, healthScore: false, sli: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <AssignQuery
            values={{ continuousVerification: false, healthScore: false, sli: true }}
            filterRemovedMetricNameThresholds={jest.fn()}
            riskProfileResponse={riskProfileResponse as any}
            healthSourceConfig={healthSourceConfigMock}
            recordProps={{
              sampleRecords: []
            }}
          />
        </Formik>
      </WrapperComponent>
    )
    expect(container.querySelector('input[name="sli"')).toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).not.toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).not.toBeChecked()
    expect(container.querySelector('label[for="riskCategory"]')).not.toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="mapPrometheus_serviceInstance"]')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render SLI if showOnlySLI prop is passed', () => {
    const { container } = render(
      <WrapperComponent>
        <Formik initialValues={{ sli: true }} onSubmit={jest.fn()} formName="runtimeInputsTest">
          <AssignQuery
            values={{ sli: true }}
            filterRemovedMetricNameThresholds={jest.fn()}
            riskProfileResponse={riskProfileResponse as any}
            showOnlySLI
            healthSourceConfig={assignSectionConfig}
            recordProps={{
              sampleRecords: []
            }}
          />
        </Formik>
      </WrapperComponent>
    )
    expect(container.querySelector('input[name="sli"')).toBeInTheDocument()
    expect(container.querySelector('input[name="healthScore"')).not.toBeInTheDocument()
    expect(container.querySelector('input[name="continuousVerification"')).not.toBeInTheDocument()
    expect(container.querySelector('label[for="riskCategory"]')).not.toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="mapPrometheus_serviceInstance"]')).not.toBeInTheDocument()
  })

  describe('Metric thresholds confirmation popup', () => {
    test('should show confirmation popup when CV of a custom metric is unchecked and that is used in metric thresholds', async () => {
      render(
        <TestWrapper>
          <CommonHealthSourceProvider updateParentFormik={jest.fn()} parentFormValues={parentFormikValuesMock}>
            <Formik
              initialValues={{ sli: true, continuousVerification: true }}
              onSubmit={jest.fn()}
              formName="runtimeInputsTest"
            >
              <AssignQuery
                values={{ sli: true, continuousVerification: true }}
                filterRemovedMetricNameThresholds={jest.fn()}
                riskProfileResponse={riskProfileResponse as any}
                healthSourceConfig={healthSourceConfigMock}
                recordProps={{
                  sampleRecords: []
                }}
              />
            </Formik>
          </CommonHealthSourceProvider>
        </TestWrapper>
      )

      const cvCheckbox = screen.getAllByTestId(/formikCheckbox/)[0]

      expect(cvCheckbox).toBeInTheDocument()
      expect(cvCheckbox).toBeChecked()

      await userEvent.click(cvCheckbox)

      await waitFor(() => expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined())
    })
  })
})
