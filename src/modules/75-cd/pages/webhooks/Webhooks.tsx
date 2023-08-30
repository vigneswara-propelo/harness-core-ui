/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Container, Dialog, Heading, Text, Views } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontVariation } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useGetEnvironmentListV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import EmptyContentImg from '@common/images/EmptySearchResults.svg'
import RbacButton from '@rbac/components/Button/Button'
import { Sort, SortFields } from '@cd/components/EnvironmentsV2/PageTemplate/utils'
import { PageStoreContext } from '@cd/components/EnvironmentsV2/PageTemplate/PageContext'
import PageTemplate from '@cd/components/EnvironmentsV2/PageTemplate/PageTemplate'
import WebhooksFilters from './WebhooksFilters/WebhooksFilters'
import WebhooksList from './WebhooksList/WebhooksList'
import WebhooksTabs from './WebhooksTabs'
import WebhooksGrid from './WebhooksGrid/WebhooksGrid'
import NewWebhookModal from './NewWebhookModal'
import { initialWebhookModalData } from './utils'
import css from './Webhooks.module.scss'

export default function Webhooks(): React.ReactElement {
  const [view, setView] = useState(Views.LIST)

  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const [showCreateModal, hideCreateModal] = useModalHook(
    /* istanbul ignore next */ () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideCreateModal}
        title={
          <>
            <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'small' }}>
              {getString('cd.webhooks.newWebhook')}
            </Text>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500}>
              {getString('cd.webhooks.createSubtitle')}
            </Text>
          </>
        }
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStylesWebhook)}
      >
        <Container>
          <NewWebhookModal isEdit={false} initialData={initialWebhookModalData} closeModal={hideCreateModal} />
        </Container>
      </Dialog>
    ),
    [orgIdentifier, projectIdentifier]
  )

  const handleCustomSortChange = /* istanbul ignore next */ (value: string): (SortFields | Sort)[] => {
    return value === SortFields.AZ09
      ? [SortFields.Name, Sort.ASC]
      : value === SortFields.ZA90
      ? [SortFields.Name, Sort.DESC]
      : [SortFields.LastUpdatedAt, Sort.DESC]
  }

  const createButtonProps = {
    text: getString('cd.webhooks.newWebhook'),
    dataTestid: 'add-webhook',
    permission: {
      // TODO add correct permissions here after BE finalises.
      permission: PermissionIdentifier.EDIT_ENVIRONMENT,
      resource: {
        resourceType: ResourceType.ENVIRONMENT
      },
      resourceScope: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
      attributeFilter: {
        attributeName: 'type',
        attributeValues: ['Production', 'PreProduction']
      }
    },
    onClick: showCreateModal
  }

  return (
    <PageStoreContext.Provider
      value={{
        view,
        setView
      }}
    >
      <HelpPanel referenceId="webhookListing" type={HelpPanelType.FLOATING_CONTAINER} />
      <PageTemplate
        title={getString('common.webhooks')}
        titleTooltipId="ff_webhook_heading"
        headerToolbar={<WebhooksTabs />}
        createButtonProps={createButtonProps}
        useGetListHook={useGetEnvironmentListV2}
        emptyContent={
          <>
            <img src={EmptyContentImg} width={300} height={150} />
            <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
              {getString('cd.webhooks.noWebhook')}
            </Heading>
            <RbacButton icon="plus" font={{ weight: 'bold' }} {...createButtonProps} />
          </>
        }
        ListComponent={WebhooksList}
        GridComponent={WebhooksGrid}
        sortOptions={[
          {
            label: getString('lastUpdatedSort'),
            value: SortFields.LastUpdatedAt
          },
          {
            label: getString('AZ09'),
            value: SortFields.AZ09
          },
          {
            label: getString('ZA90'),
            value: SortFields.ZA90
          }
        ]}
        defaultSortOption={[SortFields.LastUpdatedAt, Sort.DESC]}
        handleCustomSortChange={handleCustomSortChange}
        // TODO waiting for BE to add webhook types filterType
        filterType={'Environment'}
        FilterComponent={WebhooksFilters}
        isForceDeleteAllowed
      />
    </PageStoreContext.Provider>
  )
}
