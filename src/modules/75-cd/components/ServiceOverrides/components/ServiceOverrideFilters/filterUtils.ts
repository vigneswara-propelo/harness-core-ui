/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiSelectOption, SelectOption } from '@harness/uicore'
import { map, uniqBy, get } from 'lodash-es'
import { PageQueryParams } from '@common/constants/Pagination'

export function getInfraMultiSelectFromOptions<T>(values?: T[]): SelectOption[] | undefined {
  return uniqBy(getMultiSelectFromOptions(values), 'value')
}

export function getMultiSelectFromOptions<T>(values?: T[]): SelectOption[] | undefined {
  return map(values, item => {
    const itemIdentifier = get(item, 'identifier')
    return { label: itemIdentifier ?? item, value: itemIdentifier ?? item }
  })
}

const getEntityArray = (collection: string[] | undefined): string[] => map(collection, item => item)

type SanitizedFilterReturnType = {
  environmentIdentifiers: string[]
  serviceIdentifiers: string[]
  infraIdentifiers: string[]
}

export const getSanitizedFilter = (
  filterDetails: ServiceOverridesPageQueryParams['filters'] | null | undefined
): Partial<SanitizedFilterReturnType> => {
  if (!filterDetails) {
    return {}
  }
  const { environmentIdentifiers, serviceIdentifiers, infraIdentifiers } = filterDetails

  return {
    environmentIdentifiers: getEntityArray(environmentIdentifiers),
    serviceIdentifiers: getEntityArray(serviceIdentifiers),
    infraIdentifiers: getEntityArray(infraIdentifiers)
  }
}

export type ServiceOverridesFilterFormType = {
  environments?: MultiSelectOption[]
  services?: MultiSelectOption[]
  infrastructures?: MultiSelectOption[]
}

export interface ServiceOverridesPageQueryParams extends Omit<PageQueryParams, 'filters'> {
  filters: {
    environmentIdentifiers?: string[]
    serviceIdentifiers?: string[]
    infraIdentifiers?: string[]
  }
}
