import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { GitProviderSelect, getGitProviderCards } from '../GitProviderSelect'

const getString = (key: any): any => {
  return key
}

describe('GitProviderSelect tests', () => {
  test('initial render', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <GitProviderSelect
          gitProvider={getGitProviderCards(getString)[0]}
          setFieldValue={jest.fn()}
          connectorFieldName="connectorRef"
          repoNameFieldName="repoName"
          handleChange={jest.fn()}
          showDescription={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    expect(getByText('common.gitProvider')).toBeInTheDocument()
    expect(getByText('common.harnessCodeRepo')).toBeInTheDocument()
    expect(getByText('common.harnessCodeRepoInfo')).toBeInTheDocument()
    expect(getByText('common.thirdPartyGitProvider')).toBeInTheDocument()
    expect(getByText('common.thirdPartyGitProviderInfo')).toBeInTheDocument()
  })

  test('change git provider type', async () => {
    const { getByText } = render(
      <TestWrapper>
        <GitProviderSelect
          gitProvider={getGitProviderCards(getString)[0]}
          setFieldValue={jest.fn()}
          connectorFieldName="connectorRef"
          repoNameFieldName="repoName"
          handleChange={jest.fn()}
        />
      </TestWrapper>
    )
    const text = getByText('common.thirdPartyGitProvider')
    fireEvent.click(getByText('common.thirdPartyGitProvider'))
    expect(text).toHaveClass('StyledProps--color-primary7')

    fireEvent.click(getByText('common.harnessCodeRepo'))
    expect(text).not.toHaveClass('StyledProps--color-primary7')
  })
})
