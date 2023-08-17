/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react'
import { Breadcrumb, Container, Page, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { Category } from '@common/constants/TrackingConstants'
import ListingPageHeading from './ListingPageHeading'
import css from './ListingPageTemplate.module.scss'

export interface ListingPageTemplateProps {
  breadcrumbs?: Breadcrumb[]
  title: string
  titleTooltipId?: string
  headerContent?: ReactNode
  docsURL?: string
  videoHelp?: { trackingConst: string; label?: string }
  toolbar?: ReactNode
  pagination?: ReactNode
  footer?: ReactNode
  loading?: boolean
  error?: unknown
  retryOnError?: () => void
}

const ListingPageTemplate: FC<PropsWithChildren<ListingPageTemplateProps>> = ({
  breadcrumbs,
  title,
  titleTooltipId,
  headerContent,
  docsURL,
  videoHelp,
  toolbar,
  pagination,
  footer,
  error,
  retryOnError,
  loading,
  children
}) => {
  useDocumentTitle(title)

  enum STATUS {
    'loading',
    'error',
    'ok'
  }

  const state = useMemo<STATUS>(() => {
    if (error) {
      return STATUS.error
    } else if (loading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, loading, STATUS])

  const headerTitle = useMemo<ReactNode>(
    () => (titleTooltipId ? <ListingPageHeading tooltipId={titleTooltipId}>{title}</ListingPageHeading> : title),
    [title, titleTooltipId]
  )

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { FFM_7258_INTERCOM_VIDEO_LINKS } = useFeatureFlags()
  const hasHeaderLinks = docsURL || (FFM_7258_INTERCOM_VIDEO_LINKS && videoHelp?.trackingConst)

  return (
    <main className={css.layout}>
      <Page.Header
        title={headerTitle}
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module: 'cf' }} links={breadcrumbs} />}
        className={cx(css.header, hasHeaderLinks && css.withLinks)}
        content={headerContent}
      />

      {hasHeaderLinks && (
        <Page.SubHeader className={css.links}>
          {docsURL && (
            <a href={docsURL} target="_blank" rel="noopener noreferrer">
              <Text
                font={{ variation: FontVariation.BODY }}
                color={Color.PRIMARY_7}
                icon="learning"
                iconProps={{ color: Color.PRIMARY_7, size: 14 }}
              >
                {getString('cf.shared.readDocumentation')}
              </Text>
            </a>
          )}
          {FFM_7258_INTERCOM_VIDEO_LINKS && videoHelp?.trackingConst && (
            <a
              href=""
              onClick={e => {
                e.preventDefault()
                trackEvent(videoHelp.trackingConst, {
                  category: Category.FEATUREFLAG
                })
              }}
            >
              <Text
                font={{ variation: FontVariation.BODY }}
                color={Color.PRIMARY_7}
                icon="command-start"
                iconProps={{ color: Color.PRIMARY_7, size: 12 }}
              >
                {videoHelp.label}
              </Text>
            </a>
          )}
        </Page.SubHeader>
      )}

      {toolbar && <Page.SubHeader className={css.toolbar}>{toolbar}</Page.SubHeader>}

      <div className={css.content}>
        {state === STATUS.error && <Page.Error message={getErrorMessage(error)} onClick={retryOnError} />}
        {state === STATUS.ok && children}
      </div>

      {state === STATUS.ok && (pagination || footer) && (
        <footer className={css.footer}>
          {pagination && <Container margin={{ left: 'xlarge', right: 'xlarge' }}>{pagination}</Container>}
          {footer}
        </footer>
      )}

      {state === STATUS.loading && !error && (
        <div className={css.loading}>
          <ContainerSpinner />
        </div>
      )}
    </main>
  )
}

export default ListingPageTemplate
