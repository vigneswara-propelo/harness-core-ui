/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, Container, Pagination } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import { useUpdateQueryParams } from '@common/hooks'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { PageQueryParams } from '@common/constants/Pagination'
import { PageServiceOverridesResponseDTOV2 } from 'services/cd-ng'
import EditableRow from './Editable/EditableRow'
import ViewOnlyRow from './ViewOnly/ViewOnlyRow'
import css from './ListRows.module.scss'

const SVC_OVERRIDES_DEFAULT_PAGE_INDEX = 0

export default function ListRows(): React.ReactElement {
  const { listRowItems, serviceOverrideResponse } = useServiceOverridesContext()
  const { totalItems, pageSize, totalPages, pageIndex } = serviceOverrideResponse as PageServiceOverridesResponseDTOV2
  const { updateQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()

  const handlePageIndexChange = (index: number): void => updateQueryParams({ page: index })

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(totalItems, 0),
    pageSize: defaultTo(pageSize, 0),
    pageCount: defaultTo(totalPages, 0),
    pageIndex: defaultTo(pageIndex, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => updateQueryParams({ page: SVC_OVERRIDES_DEFAULT_PAGE_INDEX, size: newSize })
  })

  return (
    <>
      <Container padding={{ right: 'xlarge', left: 'xlarge' }} className={css.listRowContainer}>
        {listRowItems.map((listRowItem, index) => {
          const { isNew, isEdit, isClone, overrideDetails, rowIndex, groupKey } = listRowItem
          const hasTopMargin = index === 0 ? false : groupKey !== listRowItems[index - 1].groupKey
          const hasTopBorder = index === 0 ? false : !hasTopMargin
          const hasTopBorderRadius = index === 0 || hasTopMargin
          const hasBottomBorderRadius =
            index === listRowItems.length - 1 ? true : groupKey !== listRowItems[index + 1].groupKey

          return (
            <React.Fragment key={groupKey + index}>
              {hasTopBorder && <Container height={1} />}
              <Card
                key={index}
                className={cx(css.listRowCard, {
                  [css.topMargin]: hasTopMargin,
                  [css.topBorderRadius]: hasTopBorderRadius,
                  [css.bottomBorderRadius]: hasBottomBorderRadius,
                  [css.roundedCard]: hasTopBorderRadius && hasBottomBorderRadius,
                  [css.newOrEditCard]: isEdit
                })}
              >
                {isNew ? (
                  <EditableRow rowIndex={rowIndex} isNew={isNew} isEdit={false} isClone={isClone} />
                ) : (
                  overrideDetails &&
                  (isEdit ? (
                    <EditableRow
                      rowIndex={rowIndex}
                      overrideDetails={overrideDetails}
                      isEdit={isEdit}
                      isClone={isClone}
                    />
                  ) : (
                    <ViewOnlyRow rowIndex={rowIndex} overrideDetails={overrideDetails} />
                  ))
                )}
              </Card>
            </React.Fragment>
          )
        })}
      </Container>
      <div className={css.footer}>
        <Pagination {...paginationProps} />
      </div>
    </>
  )
}
