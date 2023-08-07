/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, FormEvent, useCallback, useMemo } from 'react'
import type { Cell, CellProps, Column, Renderer } from 'react-table'
import { Checkbox, Container, Layout, TableV2, Text, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import type { DeleteFeatureFlagQueryParams, Feature, FeatureMetric, Features } from 'services/cf'
import {
  featureFlagHasCustomRules,
  getDefaultVariation,
  isFeatureFlagOn,
  useFeatureFlagTypeToStringMapping
} from '@cf/utils/CFUtils'
import type { FilterProps } from '@cf/components/TableFilters/TableFilters'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import { useStrings } from 'framework/strings'
import { VariationTypeIcon } from '@cf/components/VariationTypeIcon/VariationTypeIcon'
import FlagOptionsMenuButton from '@cf/components/FlagOptionsMenuButton/FlagOptionsMenuButton'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import type { UseToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import type { UseGovernancePayload } from '@cf/hooks/useGovernance'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlagStatus, FlagStatus } from '../FlagStatus'
import { FlagResult } from '../FlagResult'
import { RenderFeatureFlag } from './RenderFeatureFlag'
import css from './FeatureFlagListing.module.scss'

export interface FeatureFlagsListingProps {
  features?: Features | null
  toggleFeatureFlag: UseToggleFeatureFlag
  featureMetrics?: FeatureMetric[]
  featureMetricsLoading?: boolean
  numberOfEnvs?: number
  governance: UseGovernancePayload
  refetchFlags: () => void
  deleteFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  onRowClick: (flagId: string) => void
}

const FeatureFlagsListing: FC<FeatureFlagsListingProps> = ({
  features,
  toggleFeatureFlag,
  featureMetrics,
  featureMetricsLoading,
  numberOfEnvs,
  governance,
  refetchFlags,
  deleteFlag,
  queryParams,
  onRowClick
}) => {
  const gitSync = useFFGitSyncContext()
  const { getString } = useStrings()

  const [flagFilter] = useQueryParamsState<Optional<FilterProps>>('filter', {})

  const onCheckboxSelect = useCallback((event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked) {
      //TODO: Handle checked
    } else {
      //TODO: Handle unchecked
    }
  }, [])

  const { FFM_8344_FLAG_CLEANUP } = useFeatureFlags()

  const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
    const data = row.original
    const isOn = isFeatureFlagOn(data)
    const hasCustomRules = featureFlagHasCustomRules(data)

    const defaultVariation = getDefaultVariation(data)

    const isFlagTypeBoolean = data.kind === FlagTypeVariations.booleanFlag
    const typeToString = useFeatureFlagTypeToStringMapping()

    return (
      <Layout.Vertical>
        <Layout.Horizontal>
          <Text>
            <VariationTypeIcon multivariate={data.kind !== FlagTypeVariations.booleanFlag} />
            {getString(isFlagTypeBoolean ? 'cf.boolean' : 'cf.multivariate')}
            {!isFlagTypeBoolean && (
              <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }}>
                ({typeToString[data.kind] || ''})
              </Text>
            )}
          </Text>
        </Layout.Horizontal>
        {!hasCustomRules && (
          <Layout.Horizontal spacing="xsmall">
            <VariationWithIcon
              variation={defaultVariation}
              index={data.variations.indexOf(defaultVariation)}
              fontSize="small"
              color={Color.GREY_400}
              textElement={getString(isOn ? 'cf.featureFlags.defaultServedOn' : 'cf.featureFlags.defaultServedOff', {
                defaultVariation: defaultVariation.name || defaultVariation.value
              })}
            />
          </Layout.Horizontal>
        )}
      </Layout.Vertical>
    )
  }

  const columns: Column<Feature>[] = useMemo(
    () => [
      {
        id: 'staleCheckbox',
        Header: (
          <div>
            <Checkbox
              aria-label="cf.staleFlagAction.selectAllPotentiallyStaleFlags"
              onClick={() => {
                //TOD: Handle Select all
              }}
            />
          </div>
        ),
        accessor: row => row,
        width: '4%',
        Cell: () => {
          return (
            <div onClick={e => e.stopPropagation()} className={css.staleCheckbox}>
              <Checkbox onClick={onCheckboxSelect} />
            </div>
          )
        },
        onCheckboxSelect
      },
      {
        Header: getString('featureFlagsText').toUpperCase(),
        accessor: row => row.name,
        width: '40%',
        Cell: (cell: Cell<Feature>) => (
          <RenderFeatureFlag
            numberOfEnvs={numberOfEnvs}
            gitSync={gitSync}
            toggleFeatureFlag={toggleFeatureFlag}
            governance={governance}
            cell={cell}
            refetchFlags={refetchFlags}
          />
        )
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.kind,
        width: '22%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        width: '21%',
        Cell: function StatusCell(cell: Cell<Feature>) {
          const metrics = featureMetrics?.find(metric => metric.identifier === cell.row.original.identifier)

          return featureMetricsLoading ? (
            <Text icon="spinner" iconProps={{ size: 14 }}>
              {getString('cf.loading')}
            </Text>
          ) : (
            <FlagStatus
              status={metrics?.status?.status as FeatureFlagStatus}
              lastAccess={metrics?.status?.lastAccess as unknown as number}
            />
          )
        }
      },
      {
        Header: getString('cf.featureFlags.results').toUpperCase(),
        accessor: row => row.results,
        width: '12%',
        Cell: function ResultCell(cell: Cell<Feature>) {
          const metrics = featureMetrics?.find(metric => metric.identifier === cell.row.original.identifier)

          return featureMetricsLoading ? (
            <Text icon="spinner" iconProps={{ size: 14 }}>
              {getString('cf.loading')}
            </Text>
          ) : (
            <FlagResult feature={cell.row.original} metrics={metrics?.results} />
          )
        }
      },
      {
        id: 'version',
        width: '5%',
        Cell: (cell: Cell<Feature>) => (
          <Container style={{ textAlign: 'right' }} onClick={Utils.stopEvent}>
            <FlagOptionsMenuButton
              environment={cell.row.original.envProperties?.environment as string}
              flagData={cell.row.original}
              queryParams={queryParams}
              deleteFlag={deleteFlag}
              gitSync={gitSync}
              refetchFlags={refetchFlags}
            />
          </Container>
        ),
        disableSortBy: true,
        refetchFlags
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      gitSync.isAutoCommitEnabled,
      gitSync.isGitSyncEnabled,
      features,
      featureMetrics,
      featureMetricsLoading,
      queryParams,
      onCheckboxSelect
    ]
  )

  const filteredColumns = useMemo(() => {
    if (FFM_8344_FLAG_CLEANUP && flagFilter?.queryProps?.value === FeatureFlagStatus.POTENTIALLY_STALE) {
      return columns
    }
    return columns.filter(column => column.id !== 'staleCheckbox')
  }, [columns, flagFilter?.queryProps?.value])

  return (
    <TableV2<Feature>
      columns={filteredColumns}
      data={features?.features ?? []}
      onRowClick={feature => onRowClick(feature.identifier)}
    />
  )
}

export default FeatureFlagsListing
