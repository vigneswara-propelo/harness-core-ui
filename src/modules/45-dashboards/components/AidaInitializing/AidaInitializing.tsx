/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ErrorResponse, GenerateTilePrompt, useGetAiGenerateTilePrompts } from 'services/custom-dashboards'
import css from './AidaInitializing.module.scss'

interface AidaInitializingProps {
  onInitialized: (tilePrompts: GenerateTilePrompt) => void
  onError: () => void
}

const AidaInitializing: React.FC<AidaInitializingProps> = ({ onInitialized, onError }) => {
  const { accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  const { data, error } = useGetAiGenerateTilePrompts({
    queryParams: { accountId }
  })

  React.useEffect(() => {
    if (data && data.resource) {
      onInitialized(data.resource)
    }
  }, [data, onInitialized])

  React.useEffect(() => {
    if (error?.data as ErrorResponse) {
      onError()
    }
  }, [error, onError])

  return (
    <Text
      font={{ variation: FontVariation.SMALL_SEMI }}
      color={Color.PURPLE_500}
      className={css.assistantMsg}
      rightIcon="loading"
      rightIconProps={{ style: { verticalAlign: 'middle' } }}
    >
      {getString('dashboards.aida.initializing')}
    </Text>
  )
}

export default AidaInitializing
