/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Layout, Popover, Button } from '@harness/uicore'
import { getFilterSummary, getFilterSize } from '@common/components/Filter/utils/FilterUtils'

import css from './ServiceOverrideFilter.module.scss'

interface ServiceOverrideFilterSelectorProps {
  onFilterBtnClick: () => void
  fieldToLabelMapping: Map<string, string>
  filterWithValidFields: {
    [key: string]: string
  }
}

export const ServiceOverrideFilterSelector: React.FC<ServiceOverrideFilterSelectorProps> = props => {
  const { onFilterBtnClick, fieldToLabelMapping, filterWithValidFields } = props

  const renderFilterBtn = React.useCallback(
    (): JSX.Element => (
      <Button
        id="ngfilterbtn"
        icon="ng-filter"
        onClick={onFilterBtnClick}
        className={css.ngFilter}
        intent="primary"
        minimal
        iconProps={{ size: 25 }}
        withoutBoxShadow
      />
    ),
    [onFilterBtnClick]
  )

  const fieldCountInAppliedFilter = getFilterSize(filterWithValidFields)

  return (
    <>
      <div className={css.filterButtonContainer}>
        {fieldCountInAppliedFilter ? (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM}
            content={getFilterSummary(fieldToLabelMapping, filterWithValidFields)}
            popoverClassName={css.summaryPopover}
          >
            {renderFilterBtn()}
          </Popover>
        ) : (
          renderFilterBtn()
        )}
      </div>
      <Layout.Horizontal>
        {fieldCountInAppliedFilter > 0 ? <span className={css.fieldCount}>{fieldCountInAppliedFilter}</span> : null}
      </Layout.Horizontal>
    </>
  )
}
