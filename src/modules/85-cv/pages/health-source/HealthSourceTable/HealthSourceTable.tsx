import React, { useCallback } from 'react'
import { cloneDeep } from 'lodash-es'
import type { CellProps, Renderer } from 'react-table'
import { Container, Icon, Layout, Text, NoDataCard, Button, ButtonVariation, TableV2 } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import type { HealthSource, HealthSourceDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import HealthSources from '@cv/components/PipelineSteps/ContinousVerification/components/HealthSources/HealthSources'
import type { RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getIconBySourceType, getTypeByFeature } from './HealthSourceTable.utils'
import CardWithOuterTitle from '../common/CardWithOuterTitle/CardWithOuterTitle'
import css from './HealthSourceTable.module.scss'

export default function HealthSourceTable({
  value,
  onEdit,
  onSuccess,
  onAddNewHealthSource,
  shouldRenderAtVerifyStep,
  isRunTimeInput
}: {
  value: any
  onSuccess: (data: HealthSourceDTO[]) => void
  onEdit: (data: HealthSource) => void
  onAddNewHealthSource: () => void
  shouldRenderAtVerifyStep?: any
  isRunTimeInput?: any
}): JSX.Element {
  const tableData = cloneDeep(value)
  const { showError } = useToaster()
  const { getString } = useStrings()

  const onDeleteHealthSource = useCallback(
    async (selectedRow: HealthSourceDTO): Promise<void> => {
      const updatedChangeSources = tableData?.filter(
        (healthSource: HealthSourceDTO) => healthSource.identifier !== selectedRow.identifier
      )
      onSuccess(updatedChangeSources)
    },
    [tableData]
  )

  const renderTypeWithIcon: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return (
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Icon className={css.sourceTypeIcon} name={getIconBySourceType(rowdata?.type as string)} size={22} />
        <ContextMenuActions
          titleText={getString('cv.healthSource.deleteHealthSource')}
          contentText={getString('cv.healthSource.deleteHealthSourceWarning') + `: ${rowdata.identifier}`}
          onDelete={() => onDeleteHealthSource(rowdata as HealthSourceDTO)}
          onEdit={() => {
            const rowFilteredData =
              tableData?.find((healthSource: RowData) => healthSource.identifier === rowdata.identifier) || null
            onEdit(rowFilteredData)
          }}
        />
      </Layout.Horizontal>
    )
  }

  const renderTypeByFeature: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return <Text>{getTypeByFeature(rowdata?.type as string, getString)}</Text>
  }

  const editRow = useCallback(rowToEdit => {
    if (rowToEdit) {
      onEdit(rowToEdit)
      return
    }
    showError(getString('cv.healthSource.noDataPresentHealthSource'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderHealthSourceTable = useCallback(
    (renderAtVerifyStep: boolean, healthSourceTableData: RowData[]) => {
      if (renderAtVerifyStep) {
        return (
          <HealthSources
            healthSources={healthSourceTableData}
            editHealthSource={editRow}
            isRunTimeInput={isRunTimeInput}
            addHealthSource={onAddNewHealthSource}
          />
        )
      }
      return (
        <CardWithOuterTitle>
          <Text className={css.tableTitle}>{getString('connectors.cdng.healthSources.label')}</Text>
          {renderHealthSourceTableInCV(healthSourceTableData)}
          <Button
            icon="plus"
            text={getString('cv.healthSource.addHealthSource')}
            variation={ButtonVariation.LINK}
            onClick={onAddNewHealthSource}
            margin={{ top: 'small' }}
          />
        </CardWithOuterTitle>
      )
    },
    [isRunTimeInput, value, onAddNewHealthSource, editRow, onEdit]
  )

  const renderHealthSourceTableInCV = useCallback(
    (healthSourceTableData: RowData[]) => {
      if (healthSourceTableData?.length) {
        return (
          <TableV2
            className={css.healthSourceTableWrapper}
            sortable={true}
            onRowClick={data => {
              const rowFilteredData = healthSourceTableData?.find(
                (healthSource: RowData) => healthSource.identifier === data.identifier
              )
              if (rowFilteredData) {
                onEdit(rowFilteredData)
              }
            }}
            columns={[
              {
                Header: getString('name'),
                accessor: 'name',
                width: '30%'
              },
              {
                Header: getString('typeLabel'),
                width: '35%',
                Cell: renderTypeByFeature
              },
              {
                Header: getString('source'),
                accessor: 'type',
                width: '35%',
                Cell: renderTypeWithIcon
              }
            ]}
            data={healthSourceTableData}
          />
        )
      }
      return (
        <Container className={css.noData}>
          <NoDataCard icon={'join-table'} message={getString('cv.healthSource.noData')} />
        </Container>
      )
    },
    [value, onAddNewHealthSource, editRow, onEdit]
  )

  return renderHealthSourceTable(!!shouldRenderAtVerifyStep, tableData)
}
