/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { OnboardingEntites } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs.constants'
import { getRoutePathByType } from '@cv/utils/routeUtils'
import { useIndexedDBHook, CVObjectStoreNames } from '../IndexedDBHook/IndexedDBHook'

export type OnClickHandlerParams<T> = {
  data?: T & BaseSetupTabsObject
  prevTab?: number
  newTab?: number
}
export interface BaseSetupTabsObject {
  name?: string
  identifier?: string
  sourceType?: 'CHANGE_SOURCE' | 'MONITORING_SOURCE' | 'VERIFICATION_JOBS'
  type?: string // Replace with types in apis
}

type CVTabsHookReturnType<T> = {
  currentTab: number
  setCurrentTab: (val: number) => void
  maxEnabledTab: number
  setMaxEnabledTab: (val: number) => void
  onNext: ({ data, prevTab, newTab }: OnClickHandlerParams<T>) => void
  onPrevious: (prevTab?: number, newTab?: number) => void
  currentData?: T
  setCurrentData: (data?: T) => void
}

const IndexDBSourceID = 'sourceID'

interface UseCVTabsHookProps {
  totalTabs: number
}

function addItemToCache(sources: any[], item: any[]): any[] {
  if (!sources?.length) {
    return item
  }

  const existingIndex = sources.findIndex(source => {
    if (!source.identifier) return
    return source.identifier === item[0].identifier
  })

  if (existingIndex !== -1) {
    sources[existingIndex] = item[0]
  } else {
    sources.push(item[0])
  }

  return sources
}

export default function useCVTabsHook<T>(props?: UseCVTabsHookProps): CVTabsHookReturnType<T> {
  const [currentTab, setCurrentTab] = useState<number>(1)
  const [currentData, setCurrentData] = useState<T>()
  const [maxEnabledTab, setMaxEnabledTab] = useState<number>(1)
  const { showWarning } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const entryKey = `${accountId}-${orgIdentifier}-${projectIdentifier}`
  const { isInitializingDB, dbInstance } = useIndexedDBHook({
    clearStroreList: [CVObjectStoreNames.ONBOARDING_SOURCES]
  })

  useEffect(() => {
    if (!isInitializingDB && dbInstance) {
      dbInstance.get(CVObjectStoreNames.ONBOARDING_SOURCES, IndexDBSourceID)?.then(data => {
        if (data) {
          setCurrentData(data.currentData)
          setCurrentTab(data.currentTab)
          setMaxEnabledTab(data.maxEnabledTab)
        }
      })
    }
  }, [isInitializingDB, dbInstance])

  const setDBData = async (data: unknown, curTab: number, maxTab: number) => {
    try {
      await dbInstance?.put(CVObjectStoreNames.ONBOARDING_SOURCES, {
        sourceID: IndexDBSourceID,
        currentData: data,
        currentTab: curTab,
        maxEnabledTab: maxTab
      })
    } catch (e) {
      showWarning(e)
    }
  }
  const getRouteUrlForOnboarding = ({ type, sourceType, identifier }: any) => {
    if (sourceType === 'CHANGE_SOURCE') {
      return routes.toCVActivitySourceEditSetup({
        projectIdentifier,
        orgIdentifier,
        accountId,
        activitySource: getRoutePathByType(type),
        activitySourceId: identifier
      })
    } else if (sourceType === 'MONITORING_SOURCE') {
      return routes.toCVAdminSetupMonitoringSourceEdit({
        projectIdentifier,
        orgIdentifier,
        accountId,
        monitoringSource: getRoutePathByType(type),
        identifier
      })
    }
  }
  return {
    currentTab,
    currentData,
    setCurrentData,
    setCurrentTab,
    maxEnabledTab,
    setMaxEnabledTab,
    onNext: async ({ data, prevTab, newTab }) => {
      if (props?.totalTabs === currentTab) {
        if (dbInstance) {
          dbInstance.get(CVObjectStoreNames.SETUP, entryKey)?.then(async resultData => {
            const item = [
              {
                type: data?.type,
                name: data?.name,
                identifier: data?.identifier,
                routeUrl: getRouteUrlForOnboarding({
                  type: data?.type,
                  sourceType: data?.sourceType,
                  identifier: data?.identifier
                })
              }
            ]
            try {
              await dbInstance.put(CVObjectStoreNames.SETUP, {
                setupID: entryKey,
                monitoringSources:
                  data?.sourceType === OnboardingEntites.MONITORING_SOURCE
                    ? addItemToCache(resultData?.monitoringSources, item)
                    : resultData?.monitoringSources,
                activitySources:
                  data?.sourceType === OnboardingEntites.CHANGE_SOURCE
                    ? addItemToCache(resultData?.activitySources, item)
                    : resultData?.activitySources,
                verificationJobs:
                  data?.sourceType === OnboardingEntites.VERIFICATION_JOBS
                    ? addItemToCache(resultData?.verificationJobs, item)
                    : resultData?.verificationJobs
              })
            } catch (e) {
              showWarning(e)
            }
          })
        }
      } else {
        if (currentTab === maxEnabledTab) {
          await setDBData(data, currentTab + 1, maxEnabledTab + 1)
          setCurrentTab(currentTab + 1)
          setMaxEnabledTab(maxEnabledTab + 1)
        } else if (currentTab < maxEnabledTab) {
          if (prevTab && newTab) {
            await setDBData(currentData, newTab, maxEnabledTab)
            setCurrentTab(newTab)
          } else {
            await setDBData(data, currentTab + 1, maxEnabledTab)
            setCurrentTab(currentTab + 1)
          }
        }
      }
    },
    onPrevious: async (prevTab, newTab) => {
      if (prevTab && newTab) {
        await setDBData(currentData, newTab, maxEnabledTab)
        setCurrentTab(newTab)
      } else {
        await setDBData(currentData, currentTab - 1, maxEnabledTab)
        setCurrentTab(currentTab - 1)
      }
    }
  }
}
