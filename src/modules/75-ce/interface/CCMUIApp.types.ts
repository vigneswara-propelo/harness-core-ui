/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { OverviewAddClusterProps } from '@ce/components/OverviewPage/OverviewAddCluster'
import type { ConnectorReferenceFieldProps } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { GatewayListFiltersProps } from '@ce/components/COGatewayList/GatewayListFilters'
import type FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import type { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import type useTestConnectionModal from '@platform/connectors/common/useTestConnectionModal/useTestConnectionModal'
export interface CCMUIAppCustomProps {
  customComponents: {
    OverviewAddCluster: React.ComponentType<OverviewAddClusterProps>
    ConnectorReferenceField: React.ComponentType<ConnectorReferenceFieldProps>
    GatewayListFilters: React.ComponentType<GatewayListFiltersProps>
    FeatureWarningBanner: typeof FeatureWarningBanner
    FeatureWarningTooltip: typeof FeatureWarningTooltip
  }
  customHooks: {
    useTestConnectionModal: typeof useTestConnectionModal
  }
}
