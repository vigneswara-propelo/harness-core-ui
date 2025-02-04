/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, MultiSelectDropDown, MultiSelectOption } from '@harness/uicore'
import type { ServiceResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ADD_NEW_VALUE } from '@cv/constants'
import { useServiceSelectOrCreate } from '../UseServiceSelectOrCreate/UseServiceSelectOrCreate'
import css from './ServiceMultiSelectOrCreate.module.scss'

export interface ServiceMultiSelectOrCreateProps {
  item?: MultiSelectOption[]
  options: Array<MultiSelectOption>
  onSelect(value: MultiSelectOption[]): void
  className?: string
  onNewCreated(value: ServiceResponseDTO): void
  disabled?: boolean
  modalTitle?: string
  placeholder?: string
  skipServiceCreateOrUpdate?: boolean
  customLoading?: boolean
}

export const ServiceMultiSelectOrCreate: React.FC<ServiceMultiSelectOrCreateProps> = props => {
  const { getString } = useStrings()

  const {
    item,
    options,
    disabled,
    className,
    modalTitle,
    placeholder,
    onNewCreated,
    customLoading,
    skipServiceCreateOrUpdate
  } = props

  const { serviceOptions, openHarnessServiceModal } = useServiceSelectOrCreate({
    options,
    modalTitle,
    onNewCreated,
    customLoading,
    skipServiceCreateOrUpdate
  })

  const onSelectChange = (val: MultiSelectOption[]): void => {
    if (val.find(it => it.value === ADD_NEW_VALUE)) {
      openHarnessServiceModal()
    } else {
      props.onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <MultiSelectDropDown
        value={item}
        disabled={disabled}
        className={className}
        items={serviceOptions}
        onChange={onSelectChange}
        buttonTestId={'multiSelectService'}
        popoverClassName={css.popOverClassName}
        placeholder={placeholder || getString('cv.selectCreateService')}
      />
    </Container>
  )
}
