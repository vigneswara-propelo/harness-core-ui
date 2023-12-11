/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { MultiSelectDropDown } from '@harness/uicore'
import type { MultiSelectOption } from '@harness/uicore'
import type { Tag } from 'services/cf'
import { useStrings } from 'framework/strings'

export interface TagFilterProps {
  tagsData: Tag[]
  onFilterChange: (tags: MultiSelectOption[]) => void
  tagFilter: MultiSelectOption[]
  disabled: boolean
  onTagSearch: (tagSearch: string) => void
}

export interface tagsDropdownValue {
  label: string
  value: string
}

const TagFilter: FC<TagFilterProps> = ({ tagsData = [], onFilterChange, disabled = false, tagFilter, onTagSearch }) => {
  const tags = useMemo(() => {
    return tagsData.map(tag => ({
      label: tag.name,
      value: tag.identifier
    }))
  }, [tagsData])

  const { getString } = useStrings()

  return (
    <MultiSelectDropDown
      allowSearch
      aria-label={getString('tagsLabel')}
      buttonTestId="tags-dropdown"
      disabled={disabled}
      hideItemCount={false}
      items={tags}
      onChange={onFilterChange}
      placeholder={getString('tagsLabel')}
      value={[...tagFilter]}
      usePortal
      expandingSearchInputProps={{ onChange: onTagSearch }}
    />
  )
}

export default TagFilter
