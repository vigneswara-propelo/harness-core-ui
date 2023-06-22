import type { StringKeys } from 'framework/strings'
import { overridesLabelStringMap, ServiceOverridesResponseDTOV2 } from './ServiceOverridesUtils'

interface RowConfig {
  headerWidth?: string | number
  rowWidth?: number
  value: StringKeys
  accessKey?: 'environmentRef' | 'infraIdentifier' | 'serviceRef' | 'overrideType'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper?: Record<any, any>
}

export const serviceOverridesConfig: Record<Required<ServiceOverridesResponseDTOV2>['type'], RowConfig[]> = {
  ENV_GLOBAL_OVERRIDE: [
    {
      headerWidth: 168,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 158,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  ENV_SERVICE_OVERRIDE: [
    {
      headerWidth: 168,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 168,
      rowWidth: 160,
      value: 'service',
      accessKey: 'serviceRef'
    },
    {
      headerWidth: 158,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  INFRA_GLOBAL_OVERRIDE: [
    {
      headerWidth: 168,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 168,
      rowWidth: 160,
      value: 'infrastructureText',
      accessKey: 'infraIdentifier'
    },
    {
      headerWidth: 158,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  INFRA_SERVICE_OVERRIDE: [
    {
      headerWidth: 140,
      rowWidth: 128,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 136,
      rowWidth: 128,
      value: 'infrastructureText',
      accessKey: 'infraIdentifier'
    },
    {
      headerWidth: 136,
      rowWidth: 128,
      value: 'service',
      accessKey: 'serviceRef'
    },
    {
      headerWidth: 136,
      rowWidth: 128,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  CLUSTER_GLOBAL_OVERRIDE: [
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'environment'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'infrastructureText'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  CLUSTER_SERVICE_OVERRIDE: [
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'environment'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'infrastructureText'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'service'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideInfo'
    }
  ]
}
