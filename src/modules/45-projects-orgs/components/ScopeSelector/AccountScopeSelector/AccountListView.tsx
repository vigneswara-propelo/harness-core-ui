/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import type { Column, Renderer, CellProps } from 'react-table'
import cx from 'classnames'
import { Container, Layout, PageSpinner, TableV2, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams, useHistory } from 'react-router-dom'
import { Intent } from '@blueprintjs/core'
import { get } from 'lodash-es'
import { Account, useRestrictedSwitchAccount, useSetDefaultAccountForCurrentUser } from 'services/portal'

import { useStrings } from 'framework/strings'

import { getLocationPathName } from 'framework/utils/WindowLocation'
import routes from '@common/RouteDefinitions'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import SecureStorage from 'framework/utils/SecureStorage'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCurrentUserInfo } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Scope } from 'framework/types/types'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import css from './AccountScopeSelector.module.scss'

interface AccountListViewProps {
  accounts: Account[]
  clickOnLoggedInAccount?: (account: Account) => void
}

const RenderColumnCompanyName: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.companyName
  return (
    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} lineClamp={1}>
      {name}
    </Text>
  )
}

const RenderColumnAccountEdition: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.licenseInfo?.accountType
  return (
    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} lineClamp={1}>
      {name}
    </Text>
  )
}

const RenderColumnLoggedInfo: Renderer<CellProps<Account>> = ({ row }) => {
  const { accountId } = useParams<AccountPathProps>()
  const currentLoggedIn = row.original.uuid === accountId
  return currentLoggedIn ? (
    <Container className={css.loggedInContainer}>
      <Text color={Color.BLUE_800} font={{ variation: FontVariation.TINY_SEMI }}>
        {'LOGGED-IN'}
      </Text>
    </Container>
  ) : null
}

export const AccountListView = (props: AccountListViewProps): JSX.Element => {
  const { accounts, clickOnLoggedInAccount } = props
  const { getString } = useStrings()
  const history = useHistory()
  const { showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [switchAccountId, setSwitchAccountId] = useState<string | undefined>()
  const { currentUserInfo, updateAppStore, ...rest } = useAppStore()
  const [accountSelected, setAccountSelected] = useState<Account>(accounts.filter(acc => acc.uuid === accountId)[0])
  const { scope } = useGetSelectedScope()

  const isOnlyOneAccount = accounts.length === 1

  const { mutate: switchAccount, loading: switchAccountLoading } = useRestrictedSwitchAccount({})
  const { mutate: setDefaultAccount, loading: settingDefault } = useSetDefaultAccountForCurrentUser({ accountId })

  const {
    data: userInfo,
    loading: userInfoLoading,
    refetch: fetchCurrentUserInfo
  } = useGetCurrentUserInfo({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  useEffect(() => {
    if (userInfo?.data?.defaultAccountId !== currentUserInfo.defaultAccountId) {
      updateAppStore({
        ...rest,
        currentUserInfo: userInfo?.data
      })
    }
  }, [userInfo])

  const handleSwitchAccount = async (account: Account): Promise<void> => {
    try {
      setSwitchAccountId(account.uuid)
      const response = await switchAccount({ accountId: account.uuid })
      if (response.resource?.requiresReAuthentication) {
        const baseUrl = window.location.origin + getLocationPathName()
        const returnUrl = `${baseUrl}#${routes.toMainDashboard({ accountId: account.uuid })}`
        history.push({
          pathname: routes.toRedirect(),
          search: `?returnUrl=${encodeURIComponent(getLoginPageURL({ returnUrl }))}`
        })
      } else if (response.resource) {
        SecureStorage.set('acctId', account.uuid)
        // This may be overriden by the defaultExperience of the most recent account opened (in AppStoreContext)
        localStorage.setItem('defaultExperience', account.defaultExperience || '')
        // this needs to be a server-redirect to support cluster isolation
        window.location.href = getLocationPathName()
      } else {
        showError(getString('common.switchAccountError'))
      }
    } catch (err) {
      setSwitchAccountId(undefined)
      showError(getString('common.switchAccountError'))
    }
  }

  const ConfirmationText = (): React.ReactElement => (
    <Layout.Vertical>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }} font={{ variation: FontVariation.BODY2 }}>
        {getString('common.switchAccountMessage', { name: accountSelected.accountName })}
      </Text>
      <Container className={css.warningContainer} padding="small">
        <Text
          intent="warning"
          icon="warning-outline"
          iconProps={{ padding: { right: 'small' } }}
          color={Color.BLACK}
          font={{ variation: FontVariation.SMALL }}
        >
          {getString('common.switchAccountWarning')}
        </Text>
      </Container>
    </Layout.Vertical>
  )

  const { openDialog: openSwitchAccountConfirmationDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('common.switch'),
    titleText: getString('common.switchAccount'),
    contentText: <ConfirmationText />,
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        handleSwitchAccount(accountSelected)
      }
    }
  })

  const RenderColumnAccountName: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    return (
      <Container className={css.accountName}>
        <Layout.Vertical>
          <Text inline lineClamp={1}>
            {account.accountName}
          </Text>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>{`Id: ${account.uuid}`}</Text>
        </Layout.Vertical>
      </Container>
    )
  }

  const RenderColumnDefaultAccount: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    const handleSetDefault = async (): Promise<void> => {
      const { resource, responseMessages } = await setDefaultAccount(undefined, {
        pathParams: { accountId: account.uuid }
      })
      if (resource === true) {
        fetchCurrentUserInfo()
      } else {
        showError(get(responseMessages, '[0].message', getString('somethingWentWrong')))
      }
    }

    const { openDialog } = useConfirmationDialog({
      cancelButtonText: getString('cancel'),
      confirmButtonText: getString('continue'),
      titleText: getString('common.changeDefaultAccountTitle'),
      contentText: getString('common.changeDefaultAccountMessage', { name: account.accountName }),
      intent: Intent.WARNING,
      onCloseDialog: isConfirmed => {
        if (isConfirmed) {
          handleSetDefault()
        }
      }
    })

    const isDefaultAccount = account.uuid === currentUserInfo?.defaultAccountId

    return (
      <Container
        className={cx(css.defaultContainer, { [css.setDefault]: !isDefaultAccount })}
        flex={{ alignItems: 'center', justifyContent: 'flex-end' }}
      >
        {isDefaultAccount ? (
          !isOnlyOneAccount && (
            <Text
              icon="success-tick"
              iconProps={{ size: 12 }}
              font={{ variation: FontVariation.TINY_SEMI }}
              color={Color.GREEN_600}
            >
              Default
            </Text>
          )
        ) : (
          <Text
            icon="tick-circle"
            iconProps={{ size: 10, color: Color.GREY_400 }}
            font={{ variation: FontVariation.TINY_SEMI }}
            color={Color.GREY_500}
            onClick={e => {
              e.stopPropagation()
              openDialog()
            }}
          >
            {getString('common.setAsDefault')}
          </Text>
        )}
      </Container>
    )
  }

  const columns: Column<Account>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'logged',
        width: '18px',
        Cell: !isOnlyOneAccount && RenderColumnLoggedInfo
      },
      {
        Header: getString('common.headerAccountName'),
        accessor: row => row.accountName,
        id: 'name',
        width: 'calc(33% - 18px)',
        Cell: RenderColumnAccountName
      },
      {
        Header: getString('common.headerCompanyName'),
        accessor: row => row.companyName,
        id: 'companyName',
        width: '30%',
        Cell: RenderColumnCompanyName
      },
      {
        Header: getString('common.headerAccountEdition'),
        accessor: row => row.licenseInfo?.accountType,
        id: 'accountType',
        width: '20%',
        Cell: RenderColumnAccountEdition
      },
      {
        Header: '',
        accessor: row => row.defaults,
        id: 'defaultAccount',
        width: '17%',
        Cell: RenderColumnDefaultAccount
      }
    ],
    [accounts, currentUserInfo, switchAccountId]
  )

  return (
    <>
      {userInfoLoading || settingDefault || switchAccountLoading ? <PageSpinner /> : undefined}
      <TableV2
        columns={columns}
        data={accounts}
        sortable={false}
        className={css.table}
        onRowClick={row => {
          if (row.uuid !== accountId) {
            setAccountSelected(row)
            openSwitchAccountConfirmationDialog()
          } else {
            clickOnLoggedInAccount?.(row)
          }
        }}
        getRowClassName={row => (row.original.uuid === accountId && scope === Scope.ACCOUNT ? css.selected : '')}
      />
    </>
  )
}
