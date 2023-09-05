/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import {
  ModuleVersionsListResponseResponse,
  ModuleVersionsResponse,
  useListModuleVersions
} from 'services/cd-ng-open-api'
import { useStrings } from 'framework/strings'
import { usePublishedDelegateVersion } from 'services/cd-ng'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './UseReleaseNotesModal.module.scss'

export interface ModuleVersionTableProps {
  moduleVersions?: ModuleVersionsListResponseResponse
}

export const ModuleVersionTable: React.FC<ModuleVersionTableProps> = () => {
  const { getString } = useStrings()
  const { accountId: accountIdentifier } = useParams<ProjectPathProps>()
  const { data } = useListModuleVersions(
    {
      queryParams: {
        page: 0
      }
    } || []
  )
  const { data: delegateversiondata } = usePublishedDelegateVersion({
    queryParams: {
      accountIdentifier
    }
  })

  const modulesList = React.useMemo((): ModuleVersionsResponse[] | null => {
    if (!data) return null
    const orderedModulesMap = new Map<string, ModuleVersionsResponse>([
      [ModuleName.CI, {}],
      [ModuleName.CD, {}],
      [ModuleName.CE, {}],
      [ModuleName.CF, {}],
      ['FF', {}],
      [ModuleName.SRM, {}],
      ['SRT', {}],
      [ModuleName.STO, {}],
      [ModuleName.CHAOS, {}],
      ['Platform', {}],
      ['Delegate', {}]
    ])
    data?.forEach((moduleData: ModuleVersionsResponse) => {
      orderedModulesMap.set(moduleData.name as string, moduleData)
    })
    // to be removed once DB is updated
    if (orderedModulesMap.has('FF') && orderedModulesMap.has('CF') && !isEmpty(orderedModulesMap.get('CF'))) {
      orderedModulesMap.delete('FF')
    }
    // to be removed once DB is updated
    if (orderedModulesMap.has('STO') && orderedModulesMap.has('SRT') && !isEmpty(orderedModulesMap.get('STO'))) {
      orderedModulesMap.delete('STO')
    }
    if (delegateversiondata?.resource?.latestSupportedVersion) {
      const oldDelegateData = orderedModulesMap.get('Delegate')
      orderedModulesMap.set('Delegate', {
        ...oldDelegateData,
        version: delegateversiondata?.resource?.latestSupportedVersion as string
      })
    }
    return [...orderedModulesMap.values()].filter((moduleData: ModuleVersionsResponse) => !isEmpty(moduleData))
  }, [data, delegateversiondata])
  return (
    <HTMLTable className={css.table} data-testid="release-note-table">
      <thead>
        <tr style={{ backgroundColor: '#E2F5FF' }} data-testid="release-note-table-head">
          <th className={css.th}>{getString('common.resourceCenter.ticketmenu.component')}</th>
          <th className={css.th}>{getString('version')}</th>
          <th className={css.th}>{getString('lastUpdated')}</th>
          <th className={css.th}>{getString('common.resourceCenter.bottomlayout.releaseNote')}</th>
        </tr>
      </thead>
      <tbody>
        {modulesList?.map((module: ModuleVersionsResponse, i: number) => (
          <tr key={`${module?.name}-${i}`} className={css.tr}>
            <td className={css.td} data-testid="name">
              {module?.display_name}
            </td>
            <td className={css.td} data-testid="version">
              {module?.version}
            </td>
            <td className={css.td} data-testid="updated">
              {module?.updated}
            </td>
            <td className={css.td} data-testid="link">
              <a href={`${module?.release_notes_link}`} target="_blank" rel="noreferrer noopener">
                {'Link'}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}
