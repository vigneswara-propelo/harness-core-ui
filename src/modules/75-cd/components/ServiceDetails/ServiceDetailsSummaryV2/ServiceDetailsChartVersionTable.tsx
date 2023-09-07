/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { defaultTo, isEmpty, isEqual, isUndefined } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { Container, getErrorInfoFromErrorObject, Icon, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import {
  GetActiveInstanceGroupedByChartVersionQueryParams,
  InstanceGroupByChartVersion,
  useGetActiveInstanceGroupedByChartVersion
} from 'services/cd-ng'
import { StringKeys, useStrings } from 'framework/strings'
import { Table } from '@common/components'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { DialogEmptyState } from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/EnvironmentDetailsUtils'
import type { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'
import { RenderEnv, RenderEnvType, RenderInstanceCount, TableRowData } from './ServiceDetailsEnvTable'
import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsChartVersionTableProps {
  chartVersionFilter?: string
  envFilter?: {
    envId?: string
    isEnvGroup: boolean
  }
  resetSearch: () => void
  setRowClickFilter: React.Dispatch<React.SetStateAction<ServiceDetailInstanceViewProps>>
  searchTerm: string
  chartVersionFilterApplied?: boolean
}

export const convertToEnvType = (envType: string): StringKeys => {
  if (envType === EnvironmentType.PRODUCTION) {
    return 'cd.serviceDashboard.prod'
  }
  return 'cd.preProduction'
}

const getChartVersionTableData = (
  chartVersionTableData: InstanceGroupByChartVersion[],
  isEnvGroup: boolean,
  envFilter?: string,
  chartVersionFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  chartVersionTableData.forEach(chartVersionDetails => {
    if ((chartVersionFilter && chartVersionDetails.chartVersion === chartVersionFilter) || !chartVersionFilter) {
      const chartVersion = chartVersionDetails.chartVersion
      const lastDeployedAt = defaultTo(chartVersionDetails.lastDeployedAt, 0)
      let showEnv = true
      let showArtifact = true
      let showChartVersion = true

      if (chartVersionDetails.instanceGroupByArtifactList) {
        chartVersionDetails.instanceGroupByArtifactList.forEach(artifact => {
          const artifactName = artifact.artifact
          if (artifact.instanceGroupedOnEnvironmentList) {
            artifact.instanceGroupedOnEnvironmentList?.forEach(env => {
              const envId = env.envId
              const envName = defaultTo(env.envName, '-')
              if (
                env.envId &&
                env.instanceGroupedOnEnvironmentTypeList &&
                ((!isEnvGroup && envFilter && env.envId === envFilter) || isEnvGroup || !envFilter)
              ) {
                env.instanceGroupedOnEnvironmentTypeList.forEach(envDetail => {
                  const envType = envDetail.environmentType
                  if (envType && envDetail.instanceGroupedOnInfrastructureList) {
                    envDetail.instanceGroupedOnInfrastructureList.forEach((infraDetail, infraDetailIdx) => {
                      const infraId = infraDetail.infrastructureId
                      const infraName = infraDetail.infrastructureName
                      const clusterId = infraDetail.clusterId
                      const instanceCount = defaultTo(infraDetail.count, 0)
                      tableData.push({
                        chartVersion: chartVersion,
                        artifact: artifactName,
                        clusterId: clusterId,
                        envId,
                        envName,
                        lastDeployedAt,
                        environmentType: envType,
                        infrastructureId: infraId,
                        infrastructureName: infraName,
                        instanceCount: instanceCount,
                        showEnv,
                        showEnvType: !infraDetailIdx,
                        showArtifact,
                        showChartVersion
                      })
                      showEnv = false
                      showArtifact = false
                      showChartVersion = false
                    })
                  }
                })
                showEnv = true
              }
            })
            showArtifact = true
          }
        })
      }
    }
  })
  return tableData
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { infrastructureId, infrastructureName, clusterId }
  }
}) => {
  const name = !infrastructureId ? clusterId : infrastructureName
  return name ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {name}
      </Text>
    </Container>
  ) : (
    <>{'-'}</>
  )
}

export const RenderArtifact: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { artifact, showArtifact }
  }
}) => {
  return showArtifact ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {artifact ? artifact : '-'}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderChartVersion: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { chartVersion, showChartVersion }
  }
}) => {
  return showChartVersion ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {chartVersion ? chartVersion : '-'}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export default function ServiceDetailsChartVersionTable(
  props: ServiceDetailsChartVersionTableProps
): React.ReactElement {
  const {
    chartVersionFilter,
    envFilter: envFilterObj,
    resetSearch,
    setRowClickFilter,
    searchTerm,
    chartVersionFilterApplied = false
  } = props
  const envFilter = envFilterObj?.envId
  const isEnvGroup = !!envFilterObj?.isEnvGroup
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = React.useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveInstanceGroupedByChartVersionQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    chartVersion: !isEmpty(chartVersionFilter) ? chartVersionFilter : undefined,
    environmentIdentifier: !isEnvGroup ? envFilter : undefined,
    envGroupIdentifier: isEnvGroup ? envFilter : undefined,
    filterOnChartVersion: chartVersionFilterApplied
  }

  const { data, loading, error, refetch } = useGetActiveInstanceGroupedByChartVersion({ queryParams })

  const chartVersionTableDetailData: InstanceGroupByChartVersion[] | undefined =
    data?.data?.instanceGroupByChartVersionList

  const filteredTableData: InstanceGroupByChartVersion[] | undefined = useMemo(() => {
    if (!searchTerm) {
      return chartVersionTableDetailData
    }

    const searchValue = searchTerm.toLocaleLowerCase()
    return chartVersionTableDetailData?.filter(
      chartVersionDetail =>
        chartVersionDetail.chartVersion?.toLocaleLowerCase().includes(searchValue) ||
        chartVersionDetail.instanceGroupByArtifactList.some(artifact =>
          artifact.instanceGroupedOnEnvironmentList?.some(
            envDetail =>
              envDetail.envName?.toLocaleLowerCase().includes(searchValue) ||
              envDetail.instanceGroupedOnEnvironmentTypeList?.some(
                envType =>
                  (envType.environmentType &&
                    getString(convertToEnvType(envType.environmentType))?.toLocaleLowerCase().includes(searchValue)) ||
                  envType.instanceGroupedOnInfrastructureList?.some(
                    infraOrCluster =>
                      infraOrCluster.clusterId?.toLocaleLowerCase().includes(searchValue) ||
                      infraOrCluster.infrastructureName?.toLocaleLowerCase().includes(searchValue)
                  )
              )
          )
        )
    )
  }, [searchTerm, chartVersionTableDetailData, getString])

  const tableData: TableRowData[] = useMemo(() => {
    return getChartVersionTableData(
      defaultTo(filteredTableData, [] as InstanceGroupByChartVersion[]),
      isEnvGroup,
      envFilter,
      chartVersionFilter
    )
  }, [envFilter, chartVersionFilter, filteredTableData, isEnvGroup])

  const searchApplied = !isEmpty(searchTerm.trim())

  useEffect(() => {
    if (searchApplied) {
      setSelectedRow(undefined)
    }
  }, [filteredTableData, searchApplied])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('pipeline.manifestType.http.chartVersion'),
        id: 'chartVersion',
        width: '23%',
        Cell: RenderChartVersion
      },
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: '22%',
        Cell: RenderArtifact
      },
      {
        Header: getString('environment'),
        id: 'environment',
        width: '20%',
        Cell: RenderEnv
      },
      {
        Header: getString('typeLabel'),
        id: 'envType',
        width: '8%',
        Cell: RenderEnvType
      },
      {
        Header: getString('cd.infra'),
        id: 'infra',
        width: '22%',
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: '5%',
        Cell: RenderInstanceCount
      }
    ]
    return columnsArray as unknown as Column<TableRowData>[]
  }, [getString])

  if (isUndefined(selectedRow) && tableData.length) {
    setRowClickFilter({
      artifact: tableData[0].artifact,
      chartVersion: tableData[0].chartVersion,
      envId: defaultTo(tableData[0].envId, ''),
      environmentType: tableData[0].environmentType as 'PreProduction' | 'Production',
      envName: defaultTo(tableData[0].envName, ''),
      clusterIdentifier: tableData[0].clusterId,
      infraIdentifier: tableData[0].infrastructureId,
      infraName: tableData[0].infrastructureName,
      isEnvView: false
    })
    setSelectedRow(`${tableData[0].artifact}-${0}`)
  }

  if (loading) {
    return (
      <Container
        flex={{ justifyContent: 'center', alignItems: 'center' }}
        height={730}
        data-testid="chartVersionTableLoading"
      >
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }
  if (error) {
    return (
      <Container data-testid="chartVersionTableError" height={730} flex={{ justifyContent: 'center' }}>
        <PageError onClick={() => refetch()} message={getErrorInfoFromErrorObject(error)} />
      </Container>
    )
  }
  if (!filteredTableData?.length) {
    return (
      <DialogEmptyState
        isArtifactView={false}
        isSearchApplied={searchApplied}
        isServicePage={true}
        resetSearch={resetSearch}
        message={getString('cd.environmentDetailPage.noServiceChartVersionMsg')}
      />
    )
  }

  return (
    <Table<TableRowData>
      columns={columns}
      data={tableData}
      className={css.fullViewTableStyle}
      onRowClick={(row, idx) => {
        setRowClickFilter({
          artifact: row.artifact,
          chartVersion: row.chartVersion,
          envId: defaultTo(row.envId, ''),
          environmentType: row.environmentType as 'PreProduction' | 'Production',
          envName: defaultTo(row.envName, ''),
          clusterIdentifier: row.clusterId,
          infraIdentifier: row.infrastructureId,
          infraName: row.infrastructureName,
          isEnvView: false
        })
        setSelectedRow(`${row.artifact}-${idx}`)
      }}
      getRowClassName={row => (isEqual(`${row.original.artifact}-${row.index}`, selectedRow) ? css.selected : '')}
    />
  )
}
