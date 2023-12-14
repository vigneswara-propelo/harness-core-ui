/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { CardSelect, Container, Icon, IconName, IconProps, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Connectors } from '@modules/27-platform/connectors/constants'
import { UseStringsReturn, useStrings } from 'framework/strings'
import { AcceptableValue } from '@modules/70-pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import css from './GitProviderSelect.module.scss'

export interface CardSelectInterface {
  type: string
  title: string
  info: string
  icon: IconName
  size: number
}

export function getGitProviderCards(getString: UseStringsReturn['getString']): CardSelectInterface[] {
  return [
    {
      type: Connectors.Harness,
      title: getString('common.harnessCodeRepo'),
      info: getString('common.harnessCodeRepoInfo'),
      icon: 'code',
      size: 22
    },
    {
      type: getString('stepPalette.others'),
      title: getString('common.thirdPartyGitProvider'),
      info: getString('common.thirdPartyGitProviderInfo'),
      icon: 'service-github',
      size: 20
    }
  ]
}

export const GitProviderSelect = ({
  gitProvider,
  setFieldValue,
  connectorFieldName,
  repoNameFieldName,
  handleChange,
  showDescription
}: {
  gitProvider: CardSelectInterface
  setFieldValue: (field: string, value: unknown) => void
  connectorFieldName: string
  repoNameFieldName: string
  handleChange: (value: AcceptableValue, type: MultiTypeInputType) => void
  showDescription?: boolean
}): JSX.Element => {
  const { getString } = useStrings()
  const [selectedProvider, setSelectedProvider] = useState(gitProvider)
  const getIconProps = (item: CardSelectInterface, isSelected: boolean): IconProps => ({
    name: item.icon as IconName,
    size: item.size,
    ...(item.type !== Connectors.Harness ? { color: isSelected ? Color.PRIMARY_7 : Color.GREY_600 } : {})
  })

  return (
    <Container padding={{ bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'small' }}>
        {getString('common.gitProvider')}
      </Text>
      <CardSelect
        data={getGitProviderCards(getString)}
        cornerSelected
        className={css.gitProviderSelect}
        renderItem={(item: CardSelectInterface) => (
          <Layout.Horizontal flex={{ justifyContent: 'start' }}>
            <Icon {...getIconProps(item, selectedProvider.type === item.type)} />
            <Container padding={{ left: 'xsmall' }}>
              <Text
                font={{ variation: FontVariation.SMALL }}
                color={selectedProvider.type === item.type ? Color.PRIMARY_7 : Color.GREY_800}
              >
                {item.title}
              </Text>
              {showDescription && <Text>{item.info}</Text>}
            </Container>
          </Layout.Horizontal>
        )}
        selected={selectedProvider}
        onChange={value => {
          setSelectedProvider(value)
          setFieldValue('provider', value)
          setFieldValue(repoNameFieldName, '')
          if (value.type === Connectors.Harness) {
            setFieldValue(connectorFieldName, '')
            handleChange('', MultiTypeInputType.FIXED)
          }
        }}
      />
    </Container>
  )
}
