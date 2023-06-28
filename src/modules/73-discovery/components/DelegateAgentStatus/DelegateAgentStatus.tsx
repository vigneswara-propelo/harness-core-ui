/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Text, Container } from '@harness/uicore'
import React from 'react'
import { useDAgentStatusColorValue, useDAgentStatusTextColor } from '@discovery/utils/StatusUtils'
import type { DatabaseDelegateTaskStatus } from 'services/servicediscovery'

interface DiscoveryAgentStatusProps {
  status: DatabaseDelegateTaskStatus | undefined
}

export const DiscoveryAgentStatus: React.FC<DiscoveryAgentStatusProps> = ({ status }) => {
  return (
    <Container
      style={{
        padding: '2px 6px',
        borderRadius: '4px',
        width: 'fit-content'
      }}
      background={useDAgentStatusColorValue(status)}
    >
      <Text style={{ fontWeight: 600 }} font={{ size: 'xsmall' }} color={useDAgentStatusTextColor(status)}>
        {status}
      </Text>
    </Container>
  )
}
