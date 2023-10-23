/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AutoDiscoveryRequestDTO } from 'services/cv'
import { UseStringsReturn } from 'framework/strings'
import { ServiceMappingFields } from './ServiceMapping.constant'

export const validateServiceMappingForm = (
  data: AutoDiscoveryRequestDTO,
  getString: UseStringsReturn['getString']
): Record<keyof AutoDiscoveryRequestDTO, string> => {
  const errorMessages = {} as Record<keyof AutoDiscoveryRequestDTO | string, string>
  if (!data.agentIdentifier) {
    errorMessages[ServiceMappingFields.AgentIdentifier] = getString('common.validation.fieldIsRequired', {
      name: getString('discovery.discoveryDetails.settings.agentName')
    })
  }
  return errorMessages
}
