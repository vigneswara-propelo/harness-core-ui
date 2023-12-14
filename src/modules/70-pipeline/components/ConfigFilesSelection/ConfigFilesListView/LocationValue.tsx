/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Text, Icon, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getParamsByScope } from '@filestore/utils/FileStoreUtils'

import { getScope } from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import css from '../ConfigFilesSelection.module.scss'

interface ILocationValueItem {
  locations: string[]
  isHarnessStore: boolean
  onClick: (path: string, scope: string) => void
  isFileStore?: boolean
  isTooltip?: boolean
  isManifest?: boolean
  directPath?: string
}

export function LocationValue(props: ILocationValueItem): React.ReactElement {
  const {
    locations,
    isHarnessStore,
    onClick,
    isFileStore = true,
    isTooltip = false,
    isManifest = false,
    directPath = ''
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const isHarnessFileStore = React.useMemo(() => {
    return isHarnessStore && isFileStore
  }, [isHarnessStore, isFileStore])

  const handleClick = (value: string): void => {
    const { scope, path } = getScope(value)

    if (isHarnessFileStore) {
      onClick(path, scope)
    }
  }

  return isManifest ? (
    <Container
      data-testid={`${directPath}`}
      key={`${directPath}`}
      onClick={() => handleClick(directPath)}
      flex={{ justifyContent: 'flex-start' }}
      style={{ flex: 1 }}
    >
      {isHarnessFileStore && <Icon name="main-view" margin={{ right: 'xsmall' }} />}
      <Text color={Color.BLACK} className={isHarnessFileStore ? css.locationLink : ''} lineClamp={1}>
        {directPath}
      </Text>
    </Container>
  ) : (
    <>
      {locations.map((locationValue: string, i: number) => {
        const { scope, path } = getScope(locationValue)
        const params = getParamsByScope(scope, { accountId, orgIdentifier, projectIdentifier })
        if (isTooltip) {
          return (
            <>
              <Text
                color={Color.BLACK}
                padding="small"
                className={isHarnessFileStore ? css.locationLink : ''}
                key={`${locationValue}${i}`}
                onClick={() => handleClick(locationValue)}
                lineClamp={1}
              >
                {isHarnessFileStore && <Icon name="edit" margin={{ right: 'xsmall' }} />}
                {locationValue}
              </Text>
              {isHarnessFileStore && (
                <Link
                  to={`${routes.toFileStore({
                    accountId,
                    ...params
                  })}?path=${path}`}
                  target="_blank"
                >
                  <Icon name="launch" margin={{ right: 'xsmall' }} />
                </Link>
              )}
            </>
          )
        }
        return (
          <Container
            flex={{ justifyContent: 'flex-start' }}
            key={`${locationValue}${i}`}
            onClick={() => handleClick(locationValue)}
            data-testid={`${locationValue}${i}`}
          >
            {isHarnessFileStore && <Icon name="main-view" margin={{ right: 'xsmall' }} />}
            <Text color={Color.BLACK} className={isHarnessFileStore ? css.locationLink : ''} lineClamp={1}>
              {locationValue}
              {!isTooltip && locations.length !== i + 1 ? ` ,` : null}
            </Text>
            {isHarnessFileStore && (
              <Link
                to={`${routes.toFileStore({
                  accountId,
                  ...params
                })}?path=${path}`}
                target="_blank"
              >
                <Icon name="launch" margin={{ right: 'xsmall' }} />
              </Link>
            )}
          </Container>
        )
      })}
    </>
  )
}
