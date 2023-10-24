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
}

export interface tagsDropdownValue {
  label: string
  value: string
}

const TagFilter: FC<TagFilterProps> = ({ tagsData = [], onFilterChange, tagFilter = [], disabled = false }) => {
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
        onChange={value => onFilterChange(value)}
        placeholder={getString('tagsLabel')}
      />
    </FormikForm>
  )
}

export default TagFilter
