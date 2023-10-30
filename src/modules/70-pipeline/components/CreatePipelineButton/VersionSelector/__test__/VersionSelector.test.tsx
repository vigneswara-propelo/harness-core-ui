/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import VersionSelector from '../VersionSelector'

describe('VersionSelector component', () => {
  test('should render VersionSelector toggle component', () => {
    const onChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <VersionSelector selectedVersion={YamlVersion[0]} onChange={onChange} />
      </TestWrapper>
    )
    expect(getByText('pipeline.yamlVersion.v0')).toBeInTheDocument()
    expect(getByText('pipeline.yamlVersion.v1')).toBeInTheDocument()
    fireEvent.click(container.querySelector('[data-name="toggle-option-one"]')!)
    expect(onChange).toHaveBeenCalledWith(YamlVersion[1])
  })
})
