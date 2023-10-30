import React from 'react'
import cx from 'classnames'
import { Tag, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { ITagProps } from '@blueprintjs/core'

import css from './VersionTag.module.scss'

export interface VersionTagProps extends ITagProps {
  version: string
}

export function VersionTag({ version, ...rest }: VersionTagProps): JSX.Element {
  return (
    <Tag className={cx(css.versionTag, rest.className)} {...rest}>
      <Text font={{ variation: FontVariation.SMALL_SEMI }}>{version}</Text>
    </Tag>
  )
}
