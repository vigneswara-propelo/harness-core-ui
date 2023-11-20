/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Page,
  Heading,
  HarnessDocTooltip,
  Pagination,
  getErrorInfoFromErrorObject,
  Layout,
  Text,
  Container,
  Dialog,
  useToaster,
  ExpandingSearchInput
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useListGitxWebhooksRefQuery, useUpdateGitxWebhookRefMutation } from '@harnessio/react-ng-manager-client'
import { defaultTo, isEmpty } from 'lodash-es'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  PAGE_TEMPLATE_DEFAULT_PAGE_INDEX,
  PageQueryParams,
  PageQueryParamsWithDefaults,
  usePageQueryParamOptions
} from '@common/constants/Pagination'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import EmptyContentImg from '@common/images/EmptySearchResults.svg'
import RbacButton from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { DEFAULT_PAGE_INDEX } from '@modules/70-pipeline/utils/constants'
import { useDocumentTitle } from '@modules/10-common/hooks/useDocumentTitle'
import WebhooksList from './WebhooksList/WebhooksList'
import NewWebhookModal from './NewWebhookModal'
import { STATUS, initialWebhookModalData, Error, WebhookTabIds } from './utils'
import NoData from './NoData'
import WebhooksTabs from './WebhooksTabs'
import css from './Webhooks.module.scss'

export function Webhooks(): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { updateQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()
  const queryParamOptions = usePageQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { page, size, searchTerm } = queryParams
  useDocumentTitle(getString('common.webhooks'))

  const { data, isInitialLoading, isFetching, error, refetch } = useListGitxWebhooksRefQuery({
    queryParams: {
      limit: size,
      page: page ? page - 1 : 0,
      webhook_identifier: searchTerm
    },
    pathParams: {
      org: orgIdentifier,
      project: projectIdentifier
    }
  })

  const {
    data: webhookUpdateData,
    error: webhookUpdateError,
    isLoading: loadingUpdateWebhook,
    mutate: updateWebhook
  } = useUpdateGitxWebhookRefMutation({})

  const isLoading = isInitialLoading || isFetching || loadingUpdateWebhook

  React.useEffect(() => {
    if (webhookUpdateData) {
      showSuccess(
        getString('pipeline.webhooks.successUpdateMessage', {
          name: webhookUpdateData.content.webhook_identifier
        })
      )
      refetch()
    }
    if (webhookUpdateError) {
      showError(getRBACErrorMessage((webhookUpdateError as Error).message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhookUpdateData, webhookUpdateError])

  const state = useMemo<STATUS>(() => {
    if (error) {
      return STATUS.error
    } else if (isLoading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, isLoading])

  const handlePageIndexChange = /* istanbul ignore next */ (index: number): void =>
    updateQueryParams({ page: index + 1 })

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(data?.pagination?.total, 0),
    pageSize: defaultTo(data?.pagination?.pageSize, 0),
    pageCount: defaultTo(data?.pagination?.pageCount, 0),
    pageIndex: defaultTo(data?.pagination?.pageNumber, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => updateQueryParams({ page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: newSize })
  })

  const response = data
  const hasData = Boolean(!isLoading && response && !isEmpty(response.content))
  const noData = Boolean(!isLoading && response && isEmpty(response.content))

  const [showCreateModal, hideCreateModal] = useModalHook(
    /* istanbul ignore next */ () => {
      const onClosehandler = (): void => {
        refetch()
        hideCreateModal()
      }

      return (
        <Dialog
          isOpen={true}
          enforceFocus={false}
          canEscapeKeyClose
          canOutsideClickClose
          onClose={onClosehandler}
          isCloseButtonShown
          className={cx('padded-dialog', css.dialogStylesWebhook)}
        >
          <Container>
            <NewWebhookModal isEdit={false} initialData={initialWebhookModalData} closeModal={onClosehandler} />
          </Container>
        </Dialog>
      )
    },
    [orgIdentifier, projectIdentifier]
  )

  const createButtonProps = {
    text: getString('pipeline.webhooks.newWebhook'),
    dataTestid: 'add-webhook',
    onClick: showCreateModal
  }
  const onSearchChange = (webhookIdentifier: string): void => {
    updateQueryParams({
      page: DEFAULT_PAGE_INDEX,
      searchTerm: webhookIdentifier
    })
  }

  return (
    <main className={css.layout}>
      <Page.Header
        title={
          <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={'ff_webhook_heading'}>
            {getString('common.webhooks')}
            <HarnessDocTooltip tooltipId={'ff_webhook_heading'} useStandAlone />
          </Heading>
        }
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
        className={css.header}
      />
      <Page.SubHeader className={css.subHeader}>
        <WebhooksTabs defaultTabId={WebhookTabIds.ListTab} />
      </Page.SubHeader>
      <Page.SubHeader className={css.toolbar}>
        <RbacButton intent="primary" icon="plus" font={{ weight: 'bold' }} {...createButtonProps} />
        <ExpandingSearchInput
          throttle={300}
          width={250}
          alwaysExpanded
          onChange={onSearchChange}
          placeholder={getString('pipeline.webhooks.searchWebhooks')}
        />
      </Page.SubHeader>
      <div className={css.content}>
        {state === STATUS.error && (
          <Page.Error message={getErrorInfoFromErrorObject(defaultTo(error, {}) as any)} onClick={refetch as any} />
        )}
        {state === STATUS.ok && !noData && (
          <Layout.Horizontal
            flex={{ justifyContent: 'space-between' }}
            padding={{ top: 'large', right: 'xlarge', left: 'xlarge' }}
          >
            <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
              {getString('total')}: {data?.pagination?.total}
            </Text>
          </Layout.Horizontal>
        )}
        {state === STATUS.ok ? (
          <>
            {noData && (
              <NoData
                hasFilters={false}
                emptyContent={
                  <>
                    <img src={EmptyContentImg} width={300} height={150} />
                    <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
                      {getString('pipeline.webhooks.noWebhook')}
                    </Heading>
                    <RbacButton icon="plus" font={{ weight: 'bold' }} {...createButtonProps} />
                  </>
                }
              />
            )}
            {hasData ? (
              <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
                <WebhooksList response={response} refetch={refetch} updateWebhook={updateWebhook} />
              </Container>
            ) : null}
          </>
        ) : null}
      </div>
      {state === STATUS.ok && (
        <div className={css.footer}>
          <Pagination {...paginationProps} />
        </div>
      )}

      {state === STATUS.loading && !error && (
        <div className={css.loading}>
          <ContainerSpinner />
        </div>
      )}
    </main>
  )
}
