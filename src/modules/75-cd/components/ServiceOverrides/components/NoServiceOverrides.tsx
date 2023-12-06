/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { PageQueryParamsWithDefaults, usePageQueryParamOptions } from '@common/constants/Pagination'
import { useQueryParams } from '@common/hooks'
import { useServiceOverridesContext } from '../context/ServiceOverrideContext'
import { noOverridesStringMap } from '../ServiceOverridesUtils'
import NewServiceOverrideButton from './NewButtonWithSearchFilter/NewServiceOverrideButton'
import NoServiceOverrideImg from './NoServiceOverride.svg'

import css from '../ServiceOverrides.module.scss'

export default function NoServiceOverrides(): React.ReactElement {
  const { getString } = useStrings()
  const { serviceOverrideType } = useServiceOverridesContext()
  const queryParamOptions = usePageQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)
  const areFiltersApplied = !isEmpty(queryParams.filters)
  const noOverridesText = areFiltersApplied
    ? `${getString(noOverridesStringMap[serviceOverrideType])} ${getString(
        'common.serviceOverrides.noOverrides.filterCriteria'
      )}`
    : getString(noOverridesStringMap[serviceOverrideType])

  return (
    <Layout.Vertical
      flex={{ justifyContent: 'center', alignItems: 'center' }}
      spacing={'medium'}
      padding={{ right: 'xlarge', left: 'xlarge' }}
      className={css.noServiceOverrideContainer}
    >
      <img src={NoServiceOverrideImg} width={230} height={140} />
      <Text>{noOverridesText}</Text>
      <NewServiceOverrideButton />
    </Layout.Vertical>
  )
}
