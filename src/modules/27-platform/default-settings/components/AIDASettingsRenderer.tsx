/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Layout, Toggle } from '@harness/uicore'

import { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import css from '@default-settings/components/SettingsCategorySection.module.scss'

export const AIDASettingsRenderer = (props: SettingRendererProps): React.ReactElement => {
  const { onSettingSelectionChange, settingValue } = props

  return (
    <>
      <Layout.Vertical flex={{ alignItems: 'flex-start' }} className={css.settingCheckBoxContainer}>
        <Toggle
          label=""
          data-testid="aidaToggleStatus"
          checked={settingValue?.value === 'true'}
          onToggle={async checked => {
            if (checked) {
              onSettingSelectionChange('true')
            } else {
              onSettingSelectionChange('false')
            }
          }}
        />
      </Layout.Vertical>
    </>
  )
}
