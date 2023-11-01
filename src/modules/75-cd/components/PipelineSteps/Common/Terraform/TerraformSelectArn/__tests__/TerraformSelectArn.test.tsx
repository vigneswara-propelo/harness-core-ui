import React from 'react'
import { render, waitFor, findByText, getByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import { useListAwsRegions } from '@modules/75-cd/components/PipelineSteps/CloudFormation/CreateStack/__tests__/ApiRequestMocks'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TerraformData } from '../../TerraformInterfaces'

import TerraformSelectArn from '../TerraformSelectArn'

const rolesMock = {
  data: {
    'arn:aws:iam::role/Test': 'TestRole',
    'arn:aws:iam::role/AnotherTest': 'AnotherTestRole'
  }
}

const connectorData = { data: connectorsData.data.content[0] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetIamRolesForAws: jest.fn().mockImplementation(() => {
    return { data: rolesMock, refetch: jest.fn(), error: null, loading: false }
  })
}))

const renderComponent = (props: TerraformData) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={props} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <TerraformSelectArn
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            fieldPath={'spec.configuration.spec'}
            pathName={'spec.configuration.spec'}
            renderConnector={true}
            renderRegion
            renderRole
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test select terraform arn', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })
  test('should render <TerraformSelectArn />', async () => {
    useListAwsRegions()

    const { container, getByTestId } = renderComponent({
      type: StepType.TerraformApply,
      name: 'test-data',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          spec: {
            providerCredential: {
              type: 'aws',
              spec: {
                connectorRef: 'test1',
                region: 'us-east-1',
                roleArn: 'testrole'
              }
            }
          }
        }
      }
    })
    expect(container).toBeDefined()
    const connnectorRefInput = getByTestId(/cr-field-spec.configuration.spec.providerCredential.spec.connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    await userEvent.click(connnectorRefInput!)
    const dialogs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogs).toHaveLength(1))
    const connectorSelectorDialog = dialogs[0] as HTMLElement
    const awsConnector1 = await findByText(connectorSelectorDialog, 'AWS')
    await waitFor(() => expect(awsConnector1).toBeInTheDocument())
    await userEvent.click(awsConnector1)
    const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applySelected)

    const regionInput = container.querySelector(
      'input[name="spec.configuration.spec.providerCredential.spec.region"]'
    ) as HTMLInputElement

    await userEvent.click(regionInput!)

    const options = findPopoverContainer()?.querySelectorAll('.Select--menuItem')
    expect(options?.length).toEqual(2)
    const firstOption = options?.[1]! as HTMLElement
    await userEvent.click(firstOption!)
    const roleArnInput = container.querySelector(
      'input[name="spec.configuration.spec.providerCredential.spec.roleArn"]'
    ) as HTMLInputElement
    await userEvent.click(roleArnInput!)
    const roleOptions = findPopoverContainer()?.querySelectorAll('.Select--menuItem')
    expect(roleOptions?.length).toEqual(2)
  })

  test('should render error <TerraformSelectArn />', async () => {
    useListAwsRegions(true, true)
    const { container, getAllByText } = renderComponent({
      type: StepType.TerraformApply,
      name: 'test-data',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          spec: {
            providerCredential: {
              type: 'aws',
              spec: {
                connectorRef: '',
                region: '',
                roleArn: ''
              }
            }
          }
        }
      }
    })
    expect(container).toBeDefined()
    expect(getAllByText('useListAwsRegions error')).toBeTruthy()
  })
  test('should render runtime', async () => {
    useListAwsRegions()
    const { container } = renderComponent({
      type: StepType.TerraformApply,
      name: 'test-data',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
        configuration: {
          spec: {
            providerCredential: {
              type: 'aws',
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                region: RUNTIME_INPUT_VALUE,
                roleArn: RUNTIME_INPUT_VALUE
              }
            }
          }
        }
      }
    })
    expect(container).toBeDefined()
  })
})
