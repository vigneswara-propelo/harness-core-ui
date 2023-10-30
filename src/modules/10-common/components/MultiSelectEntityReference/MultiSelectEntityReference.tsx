/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import cx from 'classnames'
import {
  Container,
  TextInput,
  Button,
  Layout,
  Text,
  Tabs,
  Tab,
  Icon,
  IconName,
  Checkbox,
  PageError,
  ButtonVariation,
  ButtonSize
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { debounce, isEmpty, isEqual } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import type { EntityReferenceResponse } from '../EntityReference/EntityReference'
import { disableItems } from './utils'
import css from './MultiSelectEntityReference.module.scss'

export interface Identifier {
  identifier: string
}
export interface ScopedObjectDTO extends Identifier {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}
export interface ScopeUpdatedWithPreviousData {
  [Scope.ACCOUNT]: boolean
  [Scope.ORG]: boolean
  [Scope.PROJECT]: boolean
}

export function getScopeFromDTO<T extends ScopedObjectDTO>(obj: T): Scope {
  if (obj.projectIdentifier) {
    return Scope.PROJECT
  } else if (obj.orgIdentifier) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}

export type ScopeAndIdentifier = {
  scope: Scope
  identifier: string
  record?: any
}

const getScopedItems = (items: ScopeAndIdentifier[] = [], scope: Scope) => {
  return items.filter(item => item.scope === scope)
}

export interface MultiSelectEntityReferenceProps<T> {
  fetchRecords: (
    scope: Scope,
    searchTerm: string | undefined,
    done: (records: EntityReferenceResponse<T>[]) => void
  ) => void
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  recordClassName?: string
  className?: string
  projectIdentifier?: string
  noRecordsText?: string
  orgIdentifier?: string
  defaultScope?: Scope
  searchInlineComponent?: JSX.Element
  selectedItemsUuidAndScope?: ScopeAndIdentifier[]
  onMultiSelect: (payLoad: ScopeAndIdentifier[]) => void
  onlyCurrentScope?: boolean
  disablePreSelectedItems?: boolean
  scopeCountMap?: Map<Scope, string[]>
}

export function getDefaultScope(orgIdentifier?: string, projectIdentifier?: string): Scope {
  if (!isEmpty(projectIdentifier)) {
    return Scope.PROJECT
  } else if (!isEmpty(orgIdentifier)) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}

export function MultiSelectEntityReference<T extends Identifier>(
  props: MultiSelectEntityReferenceProps<T>
): JSX.Element {
  const { getString } = useStrings()
  const {
    defaultScope,
    projectIdentifier,
    orgIdentifier,
    fetchRecords,
    className = '',
    recordRender,
    recordClassName = '',
    noRecordsText = getString('entityReference.noRecordFound'),
    searchInlineComponent,
    selectedItemsUuidAndScope,
    disablePreSelectedItems = false,
    onMultiSelect,
    onlyCurrentScope,
    scopeCountMap
  } = props
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [selectedScope, setSelectedScope] = useState<Scope>(
    defaultScope || getDefaultScope(orgIdentifier, projectIdentifier)
  )
  const [data, setData] = useState<EntityReferenceResponse<T>[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>()
  const [selectedRecord, setSelectedRecord] = useState<T>()
  const [renderedList, setRenderedList] = useState<JSX.Element>()

  const [checkedItems, setCheckedItems] = useState<ScopeAndIdentifier[]>([])

  useEffect(() => {
    if (selectedItemsUuidAndScope) {
      const tempCheckedItems: ScopeAndIdentifier[] = checkedItems
      selectedItemsUuidAndScope.forEach(el => {
        tempCheckedItems.push({ identifier: el.identifier, scope: el.scope })
      })
      setCheckedItems(tempCheckedItems)
    }
  }, [selectedItemsUuidAndScope])

  const delayedFetchRecords = useRef(
    debounce((scope: Scope, search: string | undefined, done: (records: EntityReferenceResponse<T>[]) => void) => {
      setLoading(true)
      setSelectedRecord(undefined)
      fetchRecords(scope, search, done)
    }, 300)
  ).current

  const fetchData = useCallback(() => {
    try {
      setError(null)
      if (!searchTerm) {
        setLoading(true)
        fetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      } else {
        delayedFetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      }
    } catch (msg) {
      setError(msg)
    }
  }, [selectedScope, delayedFetchRecords, searchTerm, searchInlineComponent])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onScopeChange = (scope: Scope): void => {
    setSelectedRecord(undefined)
    setSelectedScope(scope)
  }

  const iconProps = {
    size: 16
  }

  const enum TAB_ID {
    PROJECT = 'project',
    ORGANIZATION = 'organization',
    ACCOUNT = 'account'
  }

  const defaultTab =
    selectedScope === Scope.ORG
      ? TAB_ID.ORGANIZATION
      : selectedScope === Scope.PROJECT
      ? TAB_ID.PROJECT
      : TAB_ID.ACCOUNT

  const onCheckboxChange = (checked: boolean, item: ScopeAndIdentifier) => {
    const tempCheckedItems: ScopeAndIdentifier[] = [...checkedItems]
    if (checked) {
      tempCheckedItems.push(item)
    } else {
      tempCheckedItems.splice(
        tempCheckedItems.findIndex(el => el.identifier === item.identifier),
        1
      )
    }

    setCheckedItems(tempCheckedItems)
  }

  useEffect(() => {
    let renderedListTemp
    if (loading) {
      renderedListTemp = (
        <Container flex={{ align: 'center-center' }} padding="small">
          <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
        </Container>
      )
    }
    if (!loading && error) {
      renderedListTemp = (
        <Container>
          <PageError message={error} onClick={fetchData} />
        </Container>
      )
    }
    if (!loading && !error && data.length) {
      renderedListTemp = (
        <div className={cx(css.referenceList, { [css.referenceListOverflow]: data.length > 5 })}>
          {data.map((item: EntityReferenceResponse<T>) => {
            const checked = !!checkedItems.find(el => {
              return isEqual(el.identifier, item.identifier) && isEqual(el.scope, selectedScope)
            })
            return (
              <Layout.Horizontal
                key={item.identifier}
                className={cx(css.listItem, recordClassName, {
                  [css.selectedItem]: checked
                })}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              >
                <Checkbox
                  onChange={e =>
                    onCheckboxChange((e.target as any).checked, {
                      identifier: item.record.identifier,
                      scope: selectedScope
                    })
                  }
                  data-testid={`Checkbox-${item.identifier}`}
                  disabled={disableItems(item.record['identifier'], disablePreSelectedItems, selectedItemsUuidAndScope)}
                  className={css.checkbox}
                  checked={checked}
                  large
                  labelElement={recordRender({ item, selectedScope, selected: checked })}
                />
              </Layout.Horizontal>
            )
          })}
        </div>
      )
    }
    if (!loading && !error && !data.length) {
      renderedListTemp = (
        <Container padding={{ top: 'xlarge' }} flex={{ align: 'center-center' }}>
          <Text>{noRecordsText}</Text>
        </Container>
      )
    }
    setRenderedList(renderedListTemp)
  }, [selectedScope, loading, error, data, checkedItems, selectedRecord])

  const canRenderTab = (scope: Scope): boolean => {
    if (onlyCurrentScope && !isEqual(scope, defaultScope)) {
      return false
    }
    return true
  }

  const renderTab = (
    show: boolean,
    id: string,
    scope: Scope,
    icon: IconName,
    title: StringKeys
  ): React.ReactElement | null => {
    const count = getScopedItems(checkedItems, scope).length
    let multiSelectCount = null
    if (count) {
      multiSelectCount = (
        <Text
          inline
          height={19}
          margin={{ left: 'small' }}
          padding={{ left: 'xsmall', right: 'xsmall' }}
          flex={{ align: 'center-center' }}
          background={Color.PRIMARY_7}
          color={Color.WHITE}
          border={{ radius: 100 }}
        >
          {count}
        </Text>
      )
    }
    return show && canRenderTab(scope) ? (
      <Tab
        id={id}
        title={
          <Layout.Horizontal onClick={() => onScopeChange(scope)} padding={'medium'} flex={{ alignItems: 'center' }}>
            <Text>
              <Icon name={icon} {...iconProps} className={css.iconMargin} />
              {getString(title)}
            </Text>
            {multiSelectCount}
          </Layout.Horizontal>
        }
        panel={renderedList}
      />
    ) : null
  }

  const onSelect = () => {
    onMultiSelect(checkedItems)
  }

  const showWarningMessage =
    Array.isArray(scopeCountMap?.get(selectedScope)) &&
    (scopeCountMap?.get(selectedScope) as string[]).length <
      getScopedItems(selectedItemsUuidAndScope, selectedScope).length

  return (
    <Container className={cx(css.container, className)}>
      <Layout.Vertical spacing="medium">
        <div>
          {showWarningMessage && (
            <div className={css.errorMessage}>
              <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Icon name="warning-sign" intent={Intent.DANGER} />
                <Text intent={Intent.DANGER}>{getString('common.userGroupsWarningMessage')}</Text>
                <Button
                  text={getString('update')}
                  variation={ButtonVariation.SECONDARY}
                  size={ButtonSize.SMALL}
                  onClick={() => {
                    setCheckedItems(
                      checkedItems.filter(item => {
                        return (
                          item.scope !== selectedScope ||
                          Boolean(scopeCountMap?.get(selectedScope)?.find((id: string) => id === item.identifier))
                        )
                      })
                    )
                  }}
                />
              </Layout.Horizontal>
            </div>
          )}
        </div>
        <div className={css.searchBox}>
          <TextInput
            wrapperClassName={css.search}
            placeholder={getString('search')}
            leftIcon="search"
            value={searchTerm}
            autoFocus
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchInlineComponent}
        </div>
      </Layout.Vertical>
      <div className={cx(css.tabsContainer, [css.tabWidth])}>
        <Tabs id={'selectScope'} vertical defaultSelectedTabId={defaultTab}>
          {renderTab(!!projectIdentifier, TAB_ID.PROJECT, Scope.PROJECT, 'cube', 'projectLabel')}
          {renderTab(!!orgIdentifier, TAB_ID.ORGANIZATION, Scope.ORG, 'diagram-tree', 'orgLabel')}
          {renderTab(true, TAB_ID.ACCOUNT, Scope.ACCOUNT, 'layers', 'account')}
        </Tabs>
      </div>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Layout.Horizontal spacing="medium">
          <Button
            intent="primary"
            text={getString('entityReference.apply')}
            onClick={onSelect}
            disabled={!checkedItems || checkedItems.length < 1}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'small'}>
          <Text inline>{getString('common.totalSelected')}</Text>
          <Text
            inline
            padding={{ left: 'xsmall', right: 'xsmall' }}
            flex={{ align: 'center-center' }}
            background={Color.PRIMARY_7}
            color={Color.WHITE}
            border={{ radius: 100 }}
          >
            {checkedItems.length}
          </Text>
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default MultiSelectEntityReferenceProps
