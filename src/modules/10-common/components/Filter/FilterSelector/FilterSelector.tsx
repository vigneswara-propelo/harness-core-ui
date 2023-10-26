/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Menu, PopoverInteractionKind, Position, Spinner } from '@blueprintjs/core'
import { defaultTo, truncate } from 'lodash-es'
import { SelectOption, Layout, Popover, Button, DropDown, Container, Text } from '@harness/uicore'
import { IItemRendererProps, ItemListRenderer, ItemRenderer } from '@blueprintjs/select'
import { Color, FontVariation } from '@harness/design-system'
import { UseStringsReturn, useStrings } from 'framework/strings'
import { getFilterSummary, MAX_FILTER_NAME_LENGTH, getFilterSize } from '@common/components/Filter/utils/FilterUtils'
import type { FilterInterface } from '../Constants'

import css from './FilterSelector.module.scss'

interface FilterSelectorProps<T> {
  appliedFilter?: T | null
  filters?: T[]
  refetchFilters?: () => Promise<void>
  onFilterBtnClick: () => void
  onFilterSelect: (option: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void
  fieldToLabelMapping: Map<string, string>
  filterWithValidFields: {
    [key: string]: string
  }
  itemRenderer?: ItemRenderer<SelectOption>
  itemListRenderer?: ItemListRenderer<SelectOption>
}

interface customRenderProps {
  attachRefToLastElement: (index: number) => boolean
  loadMoreRef: React.MutableRefObject<null>
  isFilterListLoading: boolean
  offsetToFetch: React.MutableRefObject<number>
  isEmptyContent: boolean
  isFetchingFilterListNextTime: boolean
  getString: UseStringsReturn['getString']
}

export const customRenderersForInfiniteScroll = (
  props: customRenderProps
): {
  itemRenderer: (item: SelectOption, itemProps: IItemRendererProps) => JSX.Element
  itemListRenderer: ItemListRenderer<SelectOption>
} => {
  const {
    attachRefToLastElement,
    loadMoreRef,
    isEmptyContent,
    isFetchingFilterListNextTime,
    isFilterListLoading,
    offsetToFetch,
    getString
  } = props
  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps): JSX.Element => {
    const { handleClick, index, modifiers } = itemProps
    return (
      <div ref={attachRefToLastElement(defaultTo(index, 0)) ? loadMoreRef : undefined} key={item.label.toString()}>
        <Menu.Item text={item.label} onClick={handleClick} className={css.menuItem} {...modifiers} />
      </div>
    )
  }

  const itemListRenderer: ItemListRenderer<SelectOption> = itemListProps => {
    return (
      <Menu>
        {isFilterListLoading && offsetToFetch.current === 0 ? (
          <Container padding={'small'}>
            <Spinner size={Spinner.SIZE_SMALL} />
          </Container>
        ) : isEmptyContent || !itemListProps.items.length ? (
          <Layout.Vertical
            flex={{ align: 'center-center' }}
            font={{ variation: FontVariation.BODY }}
            color={Color.GREY_400}
            padding={'xsmall'}
          >
            {getString('common.noFiltersAvailable')}
          </Layout.Vertical>
        ) : (
          itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))
        )}
        {isFetchingFilterListNextTime && (
          <Container padding={'medium'}>
            <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
              {getString('common.fetchNextFilters')}
            </Text>
          </Container>
        )}
      </Menu>
    )
  }

  return { itemRenderer, itemListRenderer }
}

export default function FilterSelector<T extends FilterInterface>(props: FilterSelectorProps<T>): React.ReactElement {
  const {
    filters,
    onFilterBtnClick,
    onFilterSelect,
    appliedFilter,
    fieldToLabelMapping,
    filterWithValidFields,
    refetchFilters,
    itemListRenderer,
    itemRenderer
  } = props
  const { getString } = useStrings()
  const customRenderers = !!itemListRenderer && !!itemRenderer ? { itemListRenderer, itemRenderer } : {}

  const renderFilterBtn = React.useCallback(
    (): JSX.Element => (
      <Button
        id="ngfilterbtn"
        icon="ng-filter"
        onClick={onFilterBtnClick}
        className={css.ngFilter}
        intent="primary"
        minimal
        iconProps={{ size: 22 }}
        withoutBoxShadow
      />
    ),
    [onFilterBtnClick]
  )

  const fieldCountInAppliedFilter = getFilterSize(filterWithValidFields)

  const items = React.useMemo(
    () =>
      filters?.map(item => ({
        label: truncate(item?.name, { length: MAX_FILTER_NAME_LENGTH }),
        value: item?.identifier
      })) as SelectOption[] | undefined,
    [filters]
  )

  return (
    <>
      <DropDown
        buttonTestId={'filter-select'}
        onChange={onFilterSelect}
        value={appliedFilter ? appliedFilter.identifier : null}
        items={items}
        getLazyItems={refetchFilters}
        placeholder={
          filters?.length || refetchFilters
            ? getString('filters.selectFilter')
            : getString('common.filters.noFilterSaved')
        }
        minWidth={220}
        usePortal={true}
        addClearBtn={true}
        {...customRenderers}
      />
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
