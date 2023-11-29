/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo, useState } from 'react'
import { Container, ExpandingSearchInput, Icon, Layout, Text, Page } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Spinner } from '@blueprintjs/core'
import ResourceHandlerTable from '@modules/20-rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage } from '@cf/utils/CFUtils'
import { useGetAllTags } from 'services/cf'
import { useStrings } from 'framework/strings'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import css from './TagsAttributeModalBody.module.scss'

export interface TagsAttributeModalBodyProps {
  onSelectChange: (items: string[]) => void
  selectedData: string[]
}

enum STATUS {
  'error',
  'loading',
  'noData',
  'ok'
}

const TagsAttributeModalBody: FC<TagsAttributeModalBodyProps> = ({ onSelectChange, selectedData = [] }) => {
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { getString } = useStrings()

  const [pageNumber, setPageNumber] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const {
    data: tagsData,
    error: tagsError,
    loading: tagsLoading,
    refetch: refetchTags
  } = useGetAllTags({
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber,
      tagIdentifierFilter: searchTerm
    },
    debounce: 300
  })

  const state = useMemo(() => {
    if (tagsError) {
      return STATUS.error
    } else if (tagsLoading) {
      return STATUS.loading
    } else if (!tagsData?.itemCount) {
      return STATUS.noData
    }
    return STATUS.ok
  }, [tagsError, tagsLoading, tagsData?.itemCount])

  const column = [
    {
      Header: getString('tagsLabel'),
      id: 'tags',
      Cell: ({
        row: {
          original: { name }
        }
      }: {
        row: { original: { name: string } }
      }) => (
        <Layout.Vertical spacing="small">
          <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
            {name}
          </Text>
        </Layout.Vertical>
      )
    }
  ]

  return (
    <Container flex={{ justifyContent: 'center', alignItems: 'center' }} height="500px" className={css.modalBody}>
      <Container width="100%" className={css.modalContent}>
        <Layout.Horizontal padding="small">
          <ExpandingSearchInput
            disabled={!!tagsError}
            width="100%"
            autoFocus={false}
            name="tagsSearch"
            alwaysExpanded
            placeholder={getString('cf.featureFlags.tagging.search')}
            throttle={200}
            defaultValue={searchTerm}
            onChange={(query: string) => setSearchTerm(query)}
          />
        </Layout.Horizontal>
        {state === STATUS.ok && (
          <ResourceHandlerTable
            data={tagsData?.tags || []}
            selectedData={selectedData}
            columns={column}
            onSelectChange={onSelectChange}
            hideHeaders={true}
            pagination={{
              gotoPage: pageNum => setPageNumber(pageNum),
              itemCount: tagsData?.itemCount ?? 0,
              pageCount: tagsData?.pageCount ?? 0,
              pageIndex: tagsData?.pageIndex ?? 0,
              pageSize: CF_DEFAULT_PAGE_SIZE
            }}
          />
        )}
        {state === STATUS.noData && (
          <Layout.Horizontal
            spacing="small"
            width="100%"
            height="500px"
            flex={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="resources-icon" size={20} />
            <Text font="medium" color={Color.BLACK}>
              {getString('noData')}
            </Text>
          </Layout.Horizontal>
        )}
        {state === STATUS.loading && (
          <Layout.Horizontal width="100%" height="500px" flex={{ alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </Layout.Horizontal>
        )}
        {state === STATUS.error && <Page.Error message={getErrorMessage(tagsError)} onClick={() => refetchTags()} />}
      </Container>
    </Container>
  )
}

export default TagsAttributeModalBody
