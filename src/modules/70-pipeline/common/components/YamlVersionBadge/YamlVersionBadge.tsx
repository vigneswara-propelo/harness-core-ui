/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Tag } from '@harness/uicore'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import css from './YamlVersionBadge.module.scss'

interface YamlVersionBadgeProps {
  version?: YamlVersion
  minimal?: boolean
  border?: boolean
  className?: string
}

export function YamlVersionBadge({
  version = '0',
  minimal = false,
  border = false,
  className
}: YamlVersionBadgeProps): JSX.Element {
  const versionClass = `v${version}`
  const label = `v${version}`
  return (
    <Tag className={cx(css.main, versionClass, { [css.border]: border }, className)}>
      {minimal ? label : `YAML: ${label}`}
    </Tag>
  )
}
