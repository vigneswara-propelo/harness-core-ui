/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useRef } from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { IItemRendererProps } from '@blueprintjs/select'
import { Button, RUNTIME_INPUT_V1_PREFIX, Select, SelectOption, Text } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import css from './RuntimeInputSelect.module.scss'

export interface RuntimeInputSelectOption extends SelectOption {
  desc?: string
}

export interface RuntimeInputSelectProps {
  items: RuntimeInputSelectOption[]
  value?: RuntimeInputSelectOption
  disabled?: boolean
  standalone?: boolean
  createNewItemFromQuery: (query: string) => RuntimeInputSelectOption
  onChange: (item: RuntimeInputSelectOption) => void
  onSettingsClick: () => void
}

const inputItemRenderer = (item: RuntimeInputSelectOption, props: IItemRendererProps): JSX.Element | null => {
  if (!props.modifiers.matchesPredicate) {
    return null
  }

  return (
    <li
      key={item.value.toString()}
      className={cx(css.inputItem, {
        [css.active]: props.modifiers.active,
        [css.disabled]: props.modifiers.disabled
      })}
      onClick={props.handleClick}
    >
      <Text lineClamp={1} font={{ variation: FontVariation.BODY2 }}>
        {item.label}
      </Text>
      <Text lineClamp={2} font={{ variation: FontVariation.SMALL }}>
        {item.desc}
      </Text>
    </li>
  )
}

function NoInputs({ children }: { children: ReactNode }): JSX.Element {
  return (
    <li className={css.noInputs}>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
        {children}
      </Text>
    </li>
  )
}

interface CreateNewItemRendererProps {
  items: RuntimeInputSelectOption[]
  query: string
  active: boolean
  handleClick: React.MouseEventHandler<HTMLElement>
}

function CreateNewItemRenderer({ query, handleClick, items }: CreateNewItemRendererProps): JSX.Element {
  const { getString } = useStrings()
  const trimmedQuery = query.trim()

  if (!trimmedQuery) return <></>

  return (
    <>
      {!items.some(item => item.label.toString().toLowerCase().includes(query.toLowerCase())) && (
        <NoInputs>{getString('pipeline.inputDoesNotExist')}</NoInputs>
      )}

      <li className={css.divider} />
      <li className={css.createInput} onClick={handleClick}>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_7}>
          <String useRichText stringID="common.plusNewName" vars={{ name: `"${query}"` }} />
        </Text>
      </li>
    </>
  )
}

export function RuntimeInputSelect(props: RuntimeInputSelectProps): JSX.Element {
  const { items, disabled, value, standalone = false, onChange, createNewItemFromQuery, onSettingsClick } = props
  const { getString } = useStrings()
  const inputRef = useRef<null | HTMLInputElement>(null)
  const showSettings = !!value

  return (
    <Select
      inputProps={{
        placeholder: getString('pipeline.addOrSelectInput'),
        leftElement: <div className={css.runtimePrefix}>{RUNTIME_INPUT_V1_PREFIX}</div>,
        rightElement: (
          <div className={css.rightElement}>
            <Button
              minimal
              icon="chevron-down"
              iconProps={{ size: 16 }}
              disabled={disabled}
              onClick={() => inputRef.current?.focus()}
              className={css.chevronBtn}
            />
            {showSettings && (
              <Button
                minimal
                onClick={onSettingsClick}
                icon="setting"
                iconProps={{ size: 18 }}
                className={css.settingsBtn}
              />
            )}
          </div>
        ),
        inputRef: el => (inputRef.current = el),
        className: cx(css.input, showSettings && css.withSettings, standalone && css.standalone),
        disabled
      }}
      noResults={<NoInputs>{getString('pipeline.inputsDoNotExist')}</NoInputs>}
      allowCreatingNewItems
      createNewItemRenderer={(query, active, handleClick) => {
        return <CreateNewItemRenderer query={query} items={items} handleClick={handleClick} active={active} />
      }}
      popoverClassName={css.inputsPopover}
      usePortal
      items={items}
      itemRenderer={inputItemRenderer}
      disabled={disabled}
      value={value}
      onChange={onChange}
      createNewItemFromQuery={createNewItemFromQuery}
    />
  )
}
