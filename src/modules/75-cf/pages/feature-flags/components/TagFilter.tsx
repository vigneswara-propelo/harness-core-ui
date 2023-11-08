/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo } from 'react'
import { FormikForm, FormInput } from '@harness/uicore'
import type { MultiSelectOption } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { Tag } from 'services/cf'
import { useStrings } from 'framework/strings'
import css from './TagFilter.module.scss'

export interface TagFilterProps {
  tagsData?: Tag[]
  onFilterChange: (tags: MultiSelectOption[]) => void
  tagFilter: tagsDropdownValue[]
  disabled: boolean
  onTagSearch: (tagSearch: string) => void
}

export interface tagsDropdownValue {
  label: string
  value: string
}

const TagFilter: FC<TagFilterProps> = ({
  tagsData = [],
  onFilterChange,
  tagFilter = [],
  disabled = false,
  onTagSearch
}) => {
  const tags = useMemo(() => {
    return tagsData.map(tag => ({
      label: tag.name,
      value: tag.identifier
    }))
  }, [tagsData])

  const { getString } = useStrings()
  const formik = useFormikContext()

  useEffect(() => {
    if (tagFilter.length === 0 && formik.dirty) {
      formik.setFieldValue('tags', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilter.length])

  return (
    <FormikForm>
      <FormInput.MultiSelect
        aria-label={getString('tagsLabel')}
        className={css.filter}
        disabled={disabled}
        items={tags}
        name="tags"
        usePortal
        onChange={value => onFilterChange(value)}
        multiSelectProps={{
          placeholder: getString('tagsLabel'),
          allowCreatingNewItems: false,
          onQueryChange: query => onTagSearch(query)
        }}
      />
    </FormikForm>
  )
}

export default TagFilter
