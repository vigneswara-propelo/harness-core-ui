/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { FilterProps } from '@cf/components/TableFilters/TableFilters'
import { FeatureFlagStatus } from '@cf/pages/feature-flags/FlagStatus'

export function useIsStaleFlagsView(): boolean {
  const [flagFilter] = useQueryParamsState<Optional<FilterProps>>('filter', {})

  return flagFilter?.queryProps?.value === FeatureFlagStatus.POTENTIALLY_STALE
}
