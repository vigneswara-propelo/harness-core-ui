/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { omit } from 'lodash-es'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { ChangeSourceDTO } from 'services/cv'
import { ChangeSourceInputsetForm } from '../ChangeSourceInputsetForm'

const changeSources = [
  {
    category: 'Alert',
    type: 'PagerDuty',
    spec: { connectorRef: 'PDConn', pagerDutyServiceId: 'manager' },
    name: 'PD',
    identifier: 'PD',
    enabled: true
  }
] as ChangeSourceDTO[]

jest.mock('@connectors/components/ConnectorReferenceField/FormConnectorReferenceField', () => ({
  FormConnectorReferenceField: function MockComp(props: any) {
    return (
      <div>
        <button className="updateValue" onClick={() => props.formik.setFieldValue('spec', { connectorRef: 'kube' })} />
      </div>
    )
  }
}))

describe('ChangeSourceInputsetForm', () => {
  test('should render with reconcile', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <Formik formName="" initialValues={{ sources: { changeSources } }} onSubmit={() => undefined}>
          <ChangeSourceInputsetForm changeSources={changeSources} isReconcile />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('[name="sources.changeSources.0.spec.pagerDutyServiceId"]')).toHaveValue('manager')

    rerender(
      <TestWrapper>
        <ChangeSourceInputsetForm
          changeSources={[{ ...omit(changeSources[0], ['spec']) }] as ChangeSourceDTO[]}
          isReconcile
        />
      </TestWrapper>
    )

    expect(container.querySelector('p')).toHaveTextContent('changeSource: PD')

    rerender(
      <TestWrapper>
        <ChangeSourceInputsetForm changeSources={[]} isReconcile />
      </TestWrapper>
    )
  })
})
