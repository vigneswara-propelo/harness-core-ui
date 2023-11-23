import React, { useCallback } from 'react'
import cx from 'classnames'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Checkbox,
  Container,
  Layout,
  MultiSelectDropDown,
  MultiSelectOption
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ClusterTypeFiltersForLogsProps } from './ClusterTypeFiltersForLogs.types'
import { getDropdownItems, getFilterDisplayText } from '../../DeploymentMetrics/DeploymentMetrics.utils'
import { StepStatus } from '../LogAnalysis.constants'
import type { EventTypeFullName } from '../LogAnalysis.constants'
import { getClusterTypes } from '../LogAnalysis.utils'
import css from './ClusterTypeFiltersForLogs.module.scss'
import filterStyle from '../../DeploymentMetrics/DeploymentMetrics.module.scss'

const ClusterTypeFiltersForLogs: React.FC<ClusterTypeFiltersForLogsProps> = ({
  clusterTypeFilters,
  onFilterChange,
  selectedNodeName,
  nodeNames,
  nodeNamesLoading,
  nodeNamesError,
  handleNodeNameChange,
  stepStatus,
  onRefreshData
}) => {
  const { getString } = useStrings()

  const checkboxItems = getClusterTypes(getString)

  const isStepRunning = stepStatus === StepStatus.Running || stepStatus === StepStatus.AsyncWaiting

  const getFilteredText = useCallback(
    (selectedOptions: MultiSelectOption[] = [], filterText = ' '): string => {
      const baseText = getString(filterText)
      return getFilterDisplayText(selectedOptions, baseText, getString('all'))
    },
    [getString]
  )

  return (
    <Container className={css.main}>
      <Layout.Horizontal
        className={cx(css.filterContainer, {
          [css.filterContainerWithRefresh]: isStepRunning
        })}
      >
        {isStepRunning && (
          <Button
            size={ButtonSize.SMALL}
            variation={ButtonVariation.SECONDARY}
            icon="refresh"
            iconProps={{ size: 14, margin: { right: 'small' } }}
            onClick={onRefreshData}
            data-testid="logsRefreshButton"
          >
            {getString('cv.logs.refreshData')}
          </Button>
        )}
        <MultiSelectDropDown
          placeholder={getFilteredText(selectedNodeName, 'pipeline.nodesLabel')}
          value={selectedNodeName}
          className={filterStyle.filterDropdown}
          items={getDropdownItems(nodeNames?.resource as string[], nodeNamesLoading, nodeNamesError)}
          onChange={handleNodeNameChange}
          buttonTestId={'node_name_filter'}
        />
        <Layout.Horizontal margin={{ left: 'small' }} padding={{ left: 'small' }} border={{ left: true }}>
          {checkboxItems.map(item => (
            <Checkbox
              key={item.label}
              label={item.label}
              value={item.value as string}
              data-testid={item.label}
              checked={clusterTypeFilters?.includes(item.value as EventTypeFullName)}
              onChange={inputEl => {
                onFilterChange((inputEl.target as HTMLInputElement).checked, item.value as EventTypeFullName)
              }}
            />
          ))}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default ClusterTypeFiltersForLogs
