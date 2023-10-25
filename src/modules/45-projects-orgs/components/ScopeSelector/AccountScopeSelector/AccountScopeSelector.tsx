/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Container, Pagination, ExpandingSearchInput, Page } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetUserAccounts } from 'services/portal'
import { AccountListView } from './AccountListView'
import style from '../ScopeSelector.module.scss'
import css from './AccountScopeSelector.module.scss'

interface AccountScopeSelectorProps {
  clickOnLoggedInAccount: () => void
}

export const AccountScopeSelector: React.FC<AccountScopeSelectorProps> = (props): JSX.Element => {
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
    debounce: 500
  })

  const isOnlyOneAccount = data?.resource?.content?.length === 1 && searchTerm === undefined

  return (
    <Container>
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        {!isOnlyOneAccount && (
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
        )}
      </Layout.Horizontal>
      <Page.Body
        loading={loading}
        className={style.pageSpinnerStyle}
        noData={{
          when: () => !data?.resource?.content?.length && !loading,
          icon: 'Account',
          message: getString('projectsOrgs.noAccounts')
        }}
      >
        {data?.resource?.content?.length ? (
          <Layout.Vertical className={css.accountContainerWrapper}>
            <AccountListView
              accounts={defaultTo(data?.resource?.content, [])}
              clickOnLoggedInAccount={props.clickOnLoggedInAccount}
            />

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
        ) : null}
      </Page.Body>
    </Container>
  )
}
