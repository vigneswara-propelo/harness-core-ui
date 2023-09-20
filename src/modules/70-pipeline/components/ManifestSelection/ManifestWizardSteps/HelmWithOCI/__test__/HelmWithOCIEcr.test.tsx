import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectOciHelmConnector } from '../HelmWithOCIEcr'

describe('helm with OCI/ECR tests', () => {
  test(`renders without crashing`, () => {
    const onChange = jest.fn()
    const selectedConnectorType = 'Ecr'
    const { getByText } = render(
      <TestWrapper>
        <SelectOciHelmConnector selectedConnectorType={selectedConnectorType} onChange={onChange} isReadonly={false} />
      </TestWrapper>
    )

    const ecrOption = getByText('platform.connectors.ECR.name')
    expect(ecrOption).toBeDefined()
    fireEvent.click(ecrOption)

    expect(onChange).toHaveBeenCalledWith('ECR')
  })
})
