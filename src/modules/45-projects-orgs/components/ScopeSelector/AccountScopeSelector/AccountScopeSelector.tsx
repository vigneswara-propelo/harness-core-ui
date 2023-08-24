/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Container, Pagination, ExpandingSearchInput, NoDataCard, PageSpinner } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetUserAccounts } from 'services/portal'
import { AccountListView } from './AccountListView'
import css from './AccountScopeSelector.module.scss'

export const AccountScopeSelector = (): JSX.Element => {
  const { getString } = useStrings()

  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState<string>()

  const { data, loading } = useGetUserAccounts({
    queryParams: {
      pageIndex: page,
      pageSize: 30,
      searchTerm
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  return (
    <Container>
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <ExpandingSearchInput
          defaultValue={searchTerm}
          placeholder={getString('common.switchAccountSearch')}
          alwaysExpanded
          autoFocus={true}
          className={css.accountSearch}
          onChange={text => {
            setSearchTerm(text.trim())
            setPage(0)
          }}
        />
      </Layout.Horizontal>
      {loading && <PageSpinner />}
      {data?.resource?.content?.length ? (
        <Layout.Vertical className={css.accountContainerWrapper}>
          <AccountListView accounts={defaultTo(data?.resource?.content, [])} />

          <Pagination
            className={css.pagination}
            itemCount={data?.resource?.totalItems || 0}
            pageSize={data?.resource?.pageSize || 10}
            pageCount={data?.resource?.totalPages || 0}
            pageIndex={data?.resource?.pageIndex || 0}
            gotoPage={pageNumber => setPage(pageNumber)}
            hidePageNumbers
          />
        </Layout.Vertical>
      ) : !loading ? (
        <NoDataCard icon="Account" message={getString('projectsOrgs.noOrganizations')} />
      ) : null}
    </Container>
  )
}
