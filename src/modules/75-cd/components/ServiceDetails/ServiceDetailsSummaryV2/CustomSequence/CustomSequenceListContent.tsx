/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { useStrings } from 'framework/strings'
import type { EnvAndEnvGroupCard } from 'services/cd-ng'
import css from './CustomSequence.module.scss'

export const RenderEnv = ({ envGroup, name }: EnvAndEnvGroupCard): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small">
      <Text
        lineClamp={1}
        tooltipProps={{ isDark: true }}
        color={Color.GREY_700}
        font={{ variation: FontVariation.FORM_INPUT_TEXT }}
      >
        {!isEmpty(name) ? name : '--'}
      </Text>
      {envGroup && (
        <Text
          font={{ variation: FontVariation.TINY_SEMI }}
          color={Color.PRIMARY_9}
          width={45}
          height={18}
          border={{ radius: 2, color: Color.PRIMARY_2 }}
          id="groupLabel"
          background={Color.PRIMARY_1}
          flex={{ alignItems: 'center', justifyContent: 'center' }}
        >
          {getString('pipeline.verification.tableHeaders.group')}
        </Text>
      )}
    </Layout.Horizontal>
  )
}

export const RenderEnvType = ({ environmentTypes }: EnvAndEnvGroupCard): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Container flex={{ justifyContent: 'flex-start' }}>
      {environmentTypes?.map((item, index) => (
        <Text
          key={index}
          className={cx(css.environmentType, {
            [css.production]: item === EnvironmentType.PRODUCTION
          })}
          font={{ size: 'small' }}
          margin={{ right: 'small' }}
        >
          {item
            ? getString(item === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')
            : '-'}
        </Text>
      ))}
    </Container>
  )
}

export const RenderNewAddedLabel = ({ new: newAdded }: EnvAndEnvGroupCard): JSX.Element => {
  const { getString } = useStrings()
  return newAdded ? (
    <Container flex={{ alignItems: 'center', justifyContent: 'center' }} className={css.newlyAddedLabel}>
      <Text lineClamp={1} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREEN_800} id="newlyAddedLabel">
        {getString('cd.customSequence.newlyAddedLabel')}
      </Text>
    </Container>
  ) : (
    <></>
  )
}
