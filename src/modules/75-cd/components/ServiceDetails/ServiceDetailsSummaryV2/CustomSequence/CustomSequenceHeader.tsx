/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { EnvAndEnvGroupCard } from 'services/cd-ng'
import css from './CustomSequence.module.scss'

enum SortIconView {
  Inc = 'Inc',
  Desc = 'Desc',
  Both = 'Both'
}

function SortIcon({
  setUpdatedList,
  updatedList,
  originalList,
  columnName
}: {
  setUpdatedList: React.Dispatch<React.SetStateAction<EnvAndEnvGroupCard[]>>
  updatedList: EnvAndEnvGroupCard[]
  originalList: EnvAndEnvGroupCard[]
  columnName: string
}): JSX.Element {
  const [sortOption, setSortOption] = useState<SortIconView>(SortIconView.Both)

  const handleSort = (sortType: SortIconView): void => {
    if (sortOption === sortType) {
      setSortOption(SortIconView.Both)
      setUpdatedList(originalList)
    } else {
      const sortedList = Array.from(updatedList)
      sortedList.sort((a: EnvAndEnvGroupCard, b: EnvAndEnvGroupCard) => {
        const first = defaultTo(get(a, columnName)?.toString()?.toLowerCase(), '')
        const second = defaultTo(get(b, columnName)?.toString()?.toLowerCase(), '')

        // here based on the sortType selected we sort the given list in ascending or descending order
        // For sortType as SortIconView.Inc, we sort in Ascending order of the name/env_types
        if (sortType === SortIconView.Inc) {
          setSortOption(SortIconView.Desc)
          return first.localeCompare(second)
        } else {
          setSortOption(SortIconView.Inc)
          return second.localeCompare(first)
        }
      })
      setUpdatedList(sortedList)
    }
  }

  return (
    <Layout.Vertical className={css.sortIconStyle}>
      {sortOption === SortIconView.Both || sortOption === SortIconView.Inc ? (
        <Icon
          name={'main-caret-up'}
          size={6}
          padding={{ left: 'small' }}
          onClick={e => {
            e.stopPropagation()
            handleSort(SortIconView.Inc)
          }}
        />
      ) : (
        <span></span>
      )}
      {sortOption === SortIconView.Both || sortOption === SortIconView.Desc ? (
        <Icon
          name={'main-caret-down'}
          size={6}
          padding={{ left: 'small' }}
          onClick={e => {
            e.stopPropagation()
            handleSort(SortIconView.Desc)
          }}
        />
      ) : (
        <span></span>
      )}
    </Layout.Vertical>
  )
}

export function HeaderContent({
  setUpdatedList,
  updatedList,
  originalList,
  resetToDefaultSequence
}: {
  setUpdatedList: React.Dispatch<React.SetStateAction<EnvAndEnvGroupCard[]>>
  updatedList: EnvAndEnvGroupCard[]
  originalList: EnvAndEnvGroupCard[]
  resetToDefaultSequence: () => Promise<void>
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal padding={'medium'} className={css.headerContentStyle}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: 2 }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.GREY_500}>
          {getString('cd.customSequence.envSlashGroupHeader')}
        </Text>
        <SortIcon
          setUpdatedList={setUpdatedList}
          updatedList={updatedList}
          originalList={originalList}
          columnName={'name'}
        />
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: 2 }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.GREY_500}>
          {getString('typeLabel').toUpperCase()}
        </Text>
        <SortIcon
          setUpdatedList={setUpdatedList}
          updatedList={updatedList}
          originalList={originalList}
          columnName={'environmentTypes'}
        />
      </Layout.Horizontal>
      <Text
        onClick={resetToDefaultSequence}
        font={{ variation: FontVariation.BODY2 }}
        color={Color.PRIMARY_7}
        className={css.cursor}
      >
        {getString('cd.customSequence.resetToDefault')}
      </Text>
    </Layout.Horizontal>
  )
}
