/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { TextInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './AidaChatInput.module.scss'

interface AidaChatInputProps {
  onEnter: (value: string) => void
}

const AidaChatInput: React.FC<AidaChatInputProps> = ({ onEnter }) => {
  const { getString } = useStrings()
  const [value, setValue] = useState('')

  const onHandleEnter = (newValue: string): void => {
    if (newValue && newValue.length) {
      onEnter(newValue)
      setValue('')
    }
  }

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && event.currentTarget.value.length) {
      onHandleEnter(event.currentTarget.value)
    }
  }

  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setValue(e.currentTarget.value)
  }

  return (
    <TextInput
      value={value}
      placeholder={getString('common.csBot.askAIDA')}
      wrapperClassName={css.inputContainer}
      rightElement={'arrow-right'}
      rightElementProps={{ onClick: () => onHandleEnter(value), size: 24, style: { cursor: 'pointer' } }}
      onChange={onChange}
      onKeyPress={onKeyPress}
    />
  )
}

export default AidaChatInput
