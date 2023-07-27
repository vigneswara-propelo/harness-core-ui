/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Layout, Pagination, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Link } from 'react-router-dom'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import routes from '@common/RouteDefinitions'
import { useStrings, String } from 'framework/strings'
import type { Features, GetDependentFeaturesQueryParams } from 'services/cf'
import { ItemContainer } from '../ItemContainer/ItemContainer'
import css from './useArchiveFlagDialog.module.scss'

export interface CannotArchiveWarningProps {
  dependentFlagsResponse: Features
  flagIdentifier: string
  flagName: string
  queryParams: GetDependentFeaturesQueryParams
  pageNumber: number
  setPageNumber: (pageNum: number) => void
}

export const CannotArchiveWarning: FC<CannotArchiveWarningProps> = ({
  dependentFlagsResponse,
  flagName,
  queryParams,
  pageNumber,
  setPageNumber
}) => {
  const { getString } = useStrings()
  const { withActiveEnvironment } = useActiveEnvironment()

  return (
    <Layout.Vertical spacing="small">
      <String
        className={css.cannotArchiveMessage}
        stringID="cf.featureFlags.archiving.cannotArchive"
        useRichText
        vars={{ flagName }}
      />
      {dependentFlagsResponse?.features?.map(flag => (
        <ItemContainer data-testid="dependent-flag-row" key={flag.identifier}>
          <Link
            to={withActiveEnvironment(
              routes.toCFFeatureFlagsDetail({
                accountId: queryParams.accountIdentifier,
                orgIdentifier: queryParams.orgIdentifier as string,
                projectIdentifier: queryParams.projectIdentifier as string,
                featureFlagIdentifier: flag.identifier
              })
            )}
          >
            {flag.name}
          </Link>
          <Text data-testId="flagIdentifierLabel">
            {getString('common.ID')}: {flag.identifier}
          </Text>
        </ItemContainer>
      ))}
      <Text padding={{ top: 'medium' }} color={Color.GREY_500} font={{ variation: FontVariation.BODY2 }}>
        {getString('cf.featureFlags.archiving.removeFlag')}
      </Text>
      <Pagination
        gotoPage={setPageNumber}
        itemCount={dependentFlagsResponse.itemCount || 0}
        pageCount={dependentFlagsResponse.pageCount || 0}
        pageIndex={pageNumber}
        pageSize={CF_DEFAULT_PAGE_SIZE}
        showPagination={dependentFlagsResponse.pageCount > 1}
      />
    </Layout.Vertical>
  )
}

export default CannotArchiveWarning
