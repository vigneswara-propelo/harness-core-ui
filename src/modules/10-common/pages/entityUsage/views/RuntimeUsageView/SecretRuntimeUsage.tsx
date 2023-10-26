/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { ResponseSecretResponseWrapper, useListActivities } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import EntityUsageListingPage, { UsageType } from '@common/pages/entityUsage/EntityUsageListingPage'
import { useGetSecretRuntimeUsageQueryParams } from '../../utils'

interface SecretRuntimeUsageProps {
  secretData?: ResponseSecretResponseWrapper
}

const SecretRuntimeUsage: React.FC<SecretRuntimeUsageProps> = props => {
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  useDocumentTitle([
    getString('common.runtimeusage'),
    // istanbul ignore next
    props.secretData?.data?.secret.name || '',
    getString('common.secrets')
  ])

  const {
    data: activityList,
    loading,
    error: activityError,
    refetch: refetchActivities
  } = useListActivities({
    queryParams: {
      ...useGetSecretRuntimeUsageQueryParams(page, searchTerm)
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  return (
    <>
      <EntityUsageListingPage
        withSearchBarInPageHeader={false}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
        apiReturnProps={{
          data: activityList,
          loading,
          refetch: refetchActivities,
          error: activityError
        }}
        usageType={UsageType.RUNTIME}
      />
    </>
  )
}

export default SecretRuntimeUsage
