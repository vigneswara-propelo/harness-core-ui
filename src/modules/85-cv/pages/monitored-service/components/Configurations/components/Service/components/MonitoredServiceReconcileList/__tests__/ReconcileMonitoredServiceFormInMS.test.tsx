/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Button, Container } from '@harness/uicore'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as templateService from 'services/template-ng'
import { TemplateBarProps } from '@modules/70-pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { ReconcileMonitoredServiceFormInMS } from '../ReconcileMonitoredServiceFormInMS'
import { mockGetTeplates, mockTemplateInputs } from './MonitoredServiceReconcileList.mock'

const mockTemplateData = {
  isTemplateByReference: true,
  lastReconciliationTime: 1701688455424,
  templateInputs:
    'type: Application\nserviceRef: dummy\nenvironmentRef: version7\nsources:\n  healthSources:\n    - identifier: AppD\n      type: AppDynamics\n      spec:\n        applicationName: Local\n        tierName: manager-iterator\n',
  templateRef: 'MS_Temp_2',
  versionLabel: '1'
}

jest.mock(
  '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField',
  () => ({
    __esModule: true,
    default: (props: any) => (
      <Container data-testid="OrgAccountLevelServiceEnvField">
        <Button
          onClick={() => props?.serviceOnSelect({ label: 'newService', value: 'newService' })}
          title="On Service Select"
        />
        <Button
          onClick={() => props?.environmentOnSelect({ label: 'newEnv', value: 'newEnv' })}
          title="On Environment Select"
        />
      </Container>
    )
  })
)

jest.mock('framework/Templates/TemplateSelectorContext/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    getTemplate: jest.fn().mockImplementation(() => ({
      template: {
        identifier: 'SelectedTemplate101',
        versionLabel: '101'
      },
      isCopied: false
    }))
  })
}))

jest.mock('@pipeline/components/PipelineStudio/TemplateBar/TemplateBar', () => ({
  ...jest.requireActual('@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'),
  TemplateBar: (props: TemplateBarProps) => {
    const { onOpenTemplateSelector } = props
    return (
      <div className="template-bar-mock">
        <p>Using Template: MS Temp 2 (1)</p>
        <Button onClick={() => onOpenTemplateSelector?.({} as any)}>OpenTemplateSelector</Button>
      </div>
    )
  }
}))

jest.mock(
  '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils',
  () => ({
    ...(jest.requireActual(
      '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
    ) as any),
    validateInputSet: jest.fn().mockReturnValue({})
  })
)

const reconcileMSTemplate = jest.fn()
jest.mock('services/cv', () => ({
  useUpdateMonitoredServiceFromYaml: jest.fn().mockImplementation(() => {
    return { mutate: reconcileMSTemplate }
  })
}))

describe('ReconcileMonitoredServiceFormInMS', () => {
  test('should render ReconcileMonitoredServiceFormInMS', () => {
    jest.spyOn(templateService, 'useGetTemplate').mockImplementation(() => {
      return { data: mockGetTeplates } as any
    })
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(() => {
      return { data: mockTemplateInputs } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceFormInMS
          templateData={mockTemplateData}
          monitoredServiceIdentifier={'dummy_version7'}
        />
      </TestWrapper>
    )

    reconcileMSTemplate.mockRejectedValueOnce(false)
    fireEvent.click(getByText('pipeline.outOfSyncErrorStrip.reconcile'))
    expect(document.getElementsByClassName('bp3-toast-message').length).toEqual(1)

    fireEvent.click(getByText('pipeline.outOfSyncErrorStrip.reconcile'))
    expect(reconcileMSTemplate).toHaveBeenCalled()

    expect(document.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(document.querySelector('[title="On Environment Select"]')).toBeInTheDocument()

    fireEvent.click(document.querySelector('[title="On Service Select"]')!)
    fireEvent.click(document.querySelector('[title="On Environment Select"]')!)
  })
  test('should render NoData view ReconcileMonitoredServiceFormInMS', () => {
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(() => {
      return { data: {} } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceFormInMS
          templateData={mockTemplateData}
          monitoredServiceIdentifier={'dummy_version7'}
        />
      </TestWrapper>
    )

    expect(getByText('Using Template: MS Temp 2 (1)')).toBeInTheDocument()
    expect(getByText('templatesLibrary.noInputsRequired')).toBeInTheDocument()

    fireEvent.click(getByText('OpenTemplateSelector'))
  })

  test('should render no template yaml data in ReconcileMonitoredServiceFormInMS', () => {
    jest.spyOn(templateService, 'useGetTemplate').mockImplementation(() => {
      return { data: { yaml: '' } } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceFormInMS templateData={{} as any} monitoredServiceIdentifier={'dummy_version7'} />
      </TestWrapper>
    )

    expect(getByText('templatesLibrary.noInputsRequired')).toBeInTheDocument()
  })

  test('should render no template data in ReconcileMonitoredServiceFormInMS', () => {
    jest.spyOn(templateService, 'useGetTemplate').mockImplementation(() => {
      return { data: {} } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceFormInMS templateData={{} as any} monitoredServiceIdentifier={'dummy_version7'} />
      </TestWrapper>
    )

    expect(getByText('templatesLibrary.noInputsRequired')).toBeInTheDocument()
  })
})
