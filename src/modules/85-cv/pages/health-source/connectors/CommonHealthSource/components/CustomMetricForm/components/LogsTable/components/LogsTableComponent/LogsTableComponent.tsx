import React from 'react'
import type { GetDataError } from 'restful-react'
import type { Column } from 'react-table'
import moment from 'moment'
import { Container, NoDataCard, PageError, TableV2, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { LogRecord } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import css from '../../LogsTable.module.scss'

interface LogsTableComponentProps {
  loading?: boolean
  error?: GetDataError<unknown> | null
  fetchSampleRecords: () => void
  sampleData?: LogRecord[]
}

export default function LogsTableComponent(props: LogsTableComponentProps): JSX.Element | null {
  const { loading, error, sampleData, fetchSampleRecords } = props

  const { getString } = useStrings()

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => fetchSampleRecords()} />
  }

  if (loading || !sampleData) {
    return null
  }

  if (Array.isArray(sampleData) && !sampleData.length) {
    return (
      <Container className={css.noRecords}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.monitoringSources.commonHealthSource.logsTable.noSampleAvailable')}
          onClick={() => {
            fetchSampleRecords()
          }}
          buttonText={getString('retry')}
        />
      </Container>
    )
  }

  const tableColumns: Array<Column<LogRecord>> = [
    {
      Header: getString('cv.monitoringSources.commonHealthSource.logsTable.timestamp'),
      id: 'timestamp',
      accessor: row => {
        {
          const dateTime = moment(row.timestamp).format('MMMM D, YYYY hh:mm A')
          return <Text tooltip={dateTime}>{dateTime}</Text>
        }
      },
      width: '20%'
    },
    {
      Header: getString('cv.monitoringSources.commonHealthSource.logsTable.ServiceInstance'),
      id: 'serviceInstance',
      accessor: row => <Text tooltip={row.serviceInstance}>{row.serviceInstance}</Text>,
      width: '20%'
    },
    {
      Header: getString('message'),
      id: 'message',
      accessor: row => <Text tooltip={row.message}>{row.message}</Text>,
      width: '60%'
    }
  ]

  return <TableV2 className={css.logsTable} columns={tableColumns} data={sampleData?.slice(0, 20)} sortable />
}
