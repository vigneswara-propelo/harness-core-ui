/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import SRMUsageInfo from '../overview/SRMUsageInfo'

jest.mock('@common/hooks/useGetUsageAndLimit', () => {
  return {
    useGetUsageAndLimit: () => {
      return useGetUsageAndLimitReturnMock
    }
  }
})
const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      cv: {
        totalServices: 100
      }
    }
  },
  usageData: {
    usage: {
      cv: {
        activeServices: {
          count: 45,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
}
enum Edition {
  ENTERPRISE = 'ENTERPRISE'
}

enum ModuleType {
  CV = 'CV'
}
enum Status {
  ACTIVE = 'ACTIVE'
}
export const licenseData = {
  accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
  createdAt: 1676583793941,
  edition: Edition.ENTERPRISE,
  expiryTime: 9223372036854776000,
  id: '63eea37167e9e4788a2261b9',
  lastModifiedAt: 1676583793941,
  moduleType: ModuleType.CV,
  numberOfServices: 5,
  premiumSupport: false,
  selfService: true,
  startTime: 1676583793934,
  status: Status.ACTIVE
}

describe('CDUsageInfo', () => {
  test('SRMUsageInfo', () => {
    const { container } = render(
      <TestWrapper>
        <SRMUsageInfo licenseData={licenseData} module={ModuleName.SRM} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
