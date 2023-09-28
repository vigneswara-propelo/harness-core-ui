/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import {
  AccessTypeRenderer,
  IfPrivateAccess,
  IfPublicAccess,
  ifPrivateAccessHOC,
  ifPublicAccessHOC
} from 'framework/components/PublicAccess/PublicAccess'
import { TestWrapper } from '@common/utils/testUtils'

describe('Public Access Tests', () => {
  const publicContent = 'Public Access Content'
  const privateContent = 'Private Access Content'

  const WrapperWithPublicAccessEnabled = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper defaultAppStoreValues={{ isCurrentSessionPublic: true }}>{children}</TestWrapper>
  )

  test('IfPublicAccess should render its children in public access mode', () => {
    const { queryByText } = render(
      <WrapperWithPublicAccessEnabled>
        <IfPublicAccess>{publicContent}</IfPublicAccess>
      </WrapperWithPublicAccessEnabled>
    )
    expect(queryByText(publicContent)).toBeInTheDocument()
  })

  test('IfPrivateAccess should NOT render its children in public access mode', () => {
    const { queryByText } = render(
      <WrapperWithPublicAccessEnabled>
        <IfPrivateAccess>{privateContent}</IfPrivateAccess>
      </WrapperWithPublicAccessEnabled>
    )
    expect(queryByText(privateContent)).not.toBeInTheDocument()
  })

  test('AccessTypeRenderer should render the public content in public access mode', () => {
    const { queryByText } = render(
      <WrapperWithPublicAccessEnabled>
        <AccessTypeRenderer public={publicContent} private={privateContent} />
      </WrapperWithPublicAccessEnabled>
    )
    expect(queryByText(publicContent)).toBeInTheDocument()
    expect(queryByText(privateContent)).not.toBeInTheDocument()
  })

  test('ifPublicAccessHOC should render the wrapped component in public access mode', () => {
    const WrappedComponent = (): JSX.Element => <p>{publicContent}</p>
    const WrappedWithHOC = ifPublicAccessHOC(WrappedComponent)
    const { container } = render(
      <WrapperWithPublicAccessEnabled>
        <WrappedWithHOC />
      </WrapperWithPublicAccessEnabled>
    )
    expect(container).toContainHTML(`<p>${publicContent}</p>`)
  })

  test('ifPrivateAccessHOC should NOT render the wrapped component in public access mode', () => {
    const WrappedComponent = (): JSX.Element => <p>{privateContent}</p>
    const WrappedWithHOC = ifPrivateAccessHOC(WrappedComponent)
    const { container } = render(
      <WrapperWithPublicAccessEnabled>
        <WrappedWithHOC />
      </WrapperWithPublicAccessEnabled>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
