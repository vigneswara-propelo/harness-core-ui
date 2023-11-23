/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Layout, Text, Container, Pagination, PageError, NoDataCard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { MonitoredServiceDTO, useGetMonitoredServicePlatformList } from 'services/cv'
import { PageSpinner } from '@common/components'
import SaveAndDiscardButton from '@cv/components/SaveAndDiscardButton/SaveAndDiscardButton'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { MonitoredServiceForm } from '../Service/Service.types'
import SelectServiceCard from './component/SelectServiceCard'
import type { DependencyMetaData } from './component/SelectServiceCard.types'
import {
  updateMonitoredServiceWithDependencies,
  initializeDependencyMap,
  validateDependencyMap
} from './Dependency.utils'
import { getEnvironmentRef } from './component/ServiceDependencyGraph/ServiceDependencyGraph.utils'
import { ServiceDependencyGraph } from './component/ServiceDependencyGraph/ServiceDependencyGraph'
import css from './Dependency.module.scss'

export default function Dependency({
  value,
  onSuccess,
  onDiscard
}: {
  value: MonitoredServiceForm
  onSuccess: (val: any) => Promise<void>
  onDiscard?: () => void
  dependencyTabformRef?: unknown
}): JSX.Element {
  const { getString } = useStrings()

  const [dependencyMap, setDependencyMap] = useState<Map<string, DependencyMetaData>>(new Map())
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<Record<string, unknown>>()
  const { accountId, identifier, orgIdentifier, projectIdentifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [queryParams, setQueryParams] = useState({
    offset: 0,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountId,
    environmentIdentifiers: getEnvironmentRef(identifier, value)
  })

  useEffect(() => {
    if ((value.environmentRef, value.environmentRefList?.length)) {
      setQueryParams(oldQueryParams => {
        return {
          ...oldQueryParams,
          environmentIdentifiers: getEnvironmentRef(identifier, value)
        }
      })
    }
  }, [identifier, value.environmentRef, value.environmentRefList])

  const {
    data,
    loading: loadingGetMonitoredService,
    error: errorGetMonitoredService,
    refetch
  } = useGetMonitoredServicePlatformList({
    lazy: true
  })

  useEffect(() => {
    if (queryParams.environmentIdentifiers?.filter(env => Boolean(env))?.length) {
      refetch({
        queryParams,
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    }
  }, [queryParams, value.environmentRef, value.environmentRefList])

  useEffect(() => {
    if (error) {
      const updatedError = validateDependencyMap(Array.from(dependencyMap.values()))
      if (!isEqual(updatedError, error)) {
        setError(updatedError)
      }
    }
  }, [error, dependencyMap])

  const initialDependencies = useMemo(() => {
    const dependencies = initializeDependencyMap(value?.dependencies)
    setDependencyMap(dependencies)
    setIsDirty(false)
    return dependencies
  }, [value?.dependencies])

  const {
    pageIndex = -1,
    pageSize = 0,
    totalPages = 1,
    totalItems = 0,
    content: monitoredServiceList = []
  } = data?.data || {}

  const filteredMonitoredServiceList = monitoredServiceList.filter(item => item.identifier !== identifier)

  if (errorGetMonitoredService) {
    return <PageError message={getErrorMessage(errorGetMonitoredService)} onClick={() => refetch()} />
  }

  return (
    <Container>
      {loadingGetMonitoredService && <PageSpinner />}
      <SaveAndDiscardButton
        className={css.saveDiscardBlock}
        isUpdated={isDirty}
        onSave={async () => {
          const errors = validateDependencyMap(Array.from(dependencyMap.values()))
          if (!isEmpty(errors)) {
            setError(errors)
          } else {
            await onSuccess(updateMonitoredServiceWithDependencies(Array.from(dependencyMap.values()), value))
          }
        }}
        onDiscard={() => {
          setDependencyMap(initialDependencies)
          setIsDirty(false)
          onDiscard?.()
        }}
      />
      <Layout.Horizontal>
        <Container className={css.leftSection}>
          <Container margin={{ left: 'medium', right: 'medium' }}>
            <Text margin={{ bottom: 'large' }} color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('cv.Dependency.serviceList')}
            </Text>
            <Text margin={{ bottom: 'medium' }} color={Color.BLACK} font={{ size: 'small', weight: 'semi-bold' }}>
              {getString('total')} {filteredMonitoredServiceList.length}
            </Text>
          </Container>
          {!filteredMonitoredServiceList.length ? (
            <NoDataCard icon="join-table" message={getString('cv.monitoredServices.youHaveNoMonitoredServices')} />
          ) : (
            filteredMonitoredServiceList.map(service => (
              <SelectServiceCard
                key={service.identifier}
                monitoredService={{ ...service } as MonitoredServiceDTO}
                dependencyMetaData={dependencyMap.get(service.identifier || '')}
                onChange={(isChecked, dependencyMetaData) =>
                  setDependencyMap(oldMap => {
                    const newMap = new Map(oldMap)
                    if (isChecked && dependencyMetaData) {
                      newMap.set(service.identifier || '', dependencyMetaData)
                    } else {
                      newMap.delete(service.identifier || '')
                    }
                    setIsDirty(!isEqual(initialDependencies, newMap))
                    return newMap
                  })
                }
                error={error}
              />
            ))
          )}
          <Pagination
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={totalPages}
            itemCount={totalItems - 1}
            gotoPage={pageNumber => {
              const errors = validateDependencyMap(Array.from(dependencyMap.values()))
              if (!isEmpty(errors)) {
                setError(errors)
              } else {
                setQueryParams(prevParams => ({ ...prevParams, offset: pageNumber }))
              }
            }}
          />
        </Container>
        <Container className={css.rightSection}>
          <ServiceDependencyGraph
            value={value}
            identifier={identifier}
            dependencyMap={dependencyMap}
            monitoredServiceList={monitoredServiceList}
          />
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
