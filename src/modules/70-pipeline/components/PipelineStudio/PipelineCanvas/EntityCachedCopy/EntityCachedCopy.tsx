/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { GetDataError } from 'restful-react'
import cx from 'classnames'
import {
  Icon,
  IconName,
  Layout,
  useToggleOpen,
  ConfirmationDialog,
  Button,
  ButtonVariation,
  Text
} from '@harness/uicore'
import { Intent, Color } from '@harness/design-system'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { CacheResponseMetadata, Failure } from 'services/pipeline-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { StringsMap } from 'stringTypes'
import WebhookSyncDrawer from '@pipeline/pages/webhooks/WebhookSyncDrawer/WebhookSyncDrawer'
import css from './EntityCachedCopy.module.scss'

export interface EntityCachedCopyProps {
  reloadContent: string
  cacheResponse?: CacheResponseMetadata
  reloadFromCache: (loadFromCache?: boolean) => void
  fetchError?: GetDataError<Failure | Error> | null
  readonly?: boolean
  className?: string
  inlineReload?: boolean
  repo?: string
  filePath?: string
}

export interface EntityCachedCopyHandle {
  showConfirmationModal(): void
}

const cacheStateToIconMap: Record<CacheResponseMetadata['cacheState'], IconName> = {
  VALID_CACHE: 'success-tick',
  STALE_CACHE: 'stale-cache',
  UNKNOWN: 'danger-icon'
}
const cacheStateToStringMap: Record<CacheResponseMetadata['cacheState'], keyof StringsMap> = {
  VALID_CACHE: 'pipeline.gitCacheUpToDate',
  STALE_CACHE: 'pipeline.gitCacheStaleCache',
  UNKNOWN: 'pipeline.gitCacheUnknown'
}

function EntityCachedCopyInner(
  props: EntityCachedCopyProps,
  ref?: React.ForwardedRef<EntityCachedCopyHandle>
): React.ReactElement {
  const {
    reloadContent,
    cacheResponse,
    fetchError,
    reloadFromCache,
    readonly,
    className,
    inlineReload = true,
    repo,
    filePath
  } = props
  const { getString } = useStrings()
  const { isOpen: isModalOpen, close: hideModal, open: showConfirmationModal } = useToggleOpen(false)
  const { isOpen: isErrorModalOpen, close: hideErrorModal, open: showErrorModal } = useToggleOpen(false)
  const { PIE_GIT_BI_DIRECTIONAL_SYNC } = useFeatureFlags()
  const [showSyncDrawer, setShowSyncDrawer] = useState<boolean>(false)

  useEffect(() => {
    if (!isEmpty(fetchError) && !readonly) {
      showErrorModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError])

  function reloadEntity(): void {
    reloadFromCache()
  }

  const tooltipContent = (
    <div className={css.popover}>
      <span>{getString('pipeline.pipelineCachedCopy.cachedCopyText')}</span>:{' '}
      {cacheResponse?.lastUpdatedAt && formatDatetoLocale(cacheResponse.lastUpdatedAt)}
      {inlineReload && (
        <Icon
          name="refresh"
          color={Color.PRIMARY_4}
          onClick={showConfirmationModal}
          padding={{ left: 'small' }}
          className={css.reload}
        />
      )}
    </div>
  )

  const biDirectionalTooltipContent = (
    <Layout.Vertical className={css.popover} padding={'medium'}>
      {cacheResponse?.cacheState && !get(cacheResponse, 'isSyncEnabled', false) && (
        <Text
          icon={cacheStateToIconMap[cacheResponse.cacheState]}
          color={Color.WHITE}
          padding={{ bottom: 'small' }}
          font={{ weight: 'semi-bold' }}
        >
          {getString(cacheStateToStringMap[cacheResponse.cacheState]).toUpperCase()}
        </Text>
      )}
      {cacheResponse?.lastUpdatedAt && (
        <Text
          padding={{ bottom: 'medium' }}
          color={Color.WHITE}
          border={{ bottom: true, width: 1, color: Color.GREY_200 }}
        >{`${getString('pipeline.pipelineCachedCopy.cachedCopyText')} : ${formatDatetoLocale(
          cacheResponse.lastUpdatedAt
        )}`}</Text>
      )}
      <Layout.Horizontal padding={{ top: 'medium' }}>
        {inlineReload && !get(cacheResponse, 'isSyncEnabled', false) && (
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('common.reload')}
            onClick={showConfirmationModal}
            minimal
            className={css.reload}
          />
        )}
        {get(cacheResponse, 'isSyncEnabled', false) && (
          <Text
            onClick={() => setShowSyncDrawer(true)}
            className={css.hoverUnderline}
            color={Color.PRIMARY_5}
            padding={{ left: 'small' }}
          >
            {getString('pipeline.viewSyncActivities')}
          </Text>
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )

  React.useImperativeHandle(ref, () => ({
    showConfirmationModal
  }))

  function handleReconcileConfirmClick(confirm: boolean): void {
    if (confirm) {
      reloadEntity()
    }

    hideModal()
  }

  function handleReconcileRetryClick(confirm: boolean): void {
    if (confirm) {
      reloadEntity()
    }

    hideErrorModal()
  }

  return (
    <>
      {cacheResponse && (
        <div className={cx(css.cachedcopy, className)}>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }} spacing="small">
            <Button
              minimal
              variation={ButtonVariation.ICON}
              icon={cacheStateToIconMap[cacheResponse.cacheState]}
              withoutCurrentColor
              tooltipProps={{ isDark: true, interactionKind: 'hover', position: 'bottom' }}
              tooltip={PIE_GIT_BI_DIRECTIONAL_SYNC ? biDirectionalTooltipContent : tooltipContent}
            />
          </Layout.Horizontal>
        </div>
      )}
      <ConfirmationDialog
        intent={Intent.WARNING}
        isOpen={isModalOpen}
        onClose={handleReconcileConfirmClick}
        titleText={getString('pipeline.pipelineCachedCopy.reloadPipeline', { pageType: reloadContent })}
        contentText={getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        confirmButtonText={getString('confirm')}
        cancelButtonText={getString('cancel')}
      />
      <ConfirmationDialog
        intent={Intent.DANGER}
        isOpen={isErrorModalOpen}
        onClose={handleReconcileRetryClick}
        titleText={getString('pipeline.pipelineCachedCopy.cacheUpdateFailed')}
        contentText={getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        confirmButtonText={getString('common.tryAgain')}
        cancelButtonText={getString('cancel')}
      />
      {showSyncDrawer && (
        <WebhookSyncDrawer
          onClose={() => setShowSyncDrawer(false)}
          repoName={defaultTo(repo, '')}
          filePath={defaultTo(filePath, '')}
        />
      )}
    </>
  )
}

export const EntityCachedCopy = React.forwardRef(EntityCachedCopyInner)
