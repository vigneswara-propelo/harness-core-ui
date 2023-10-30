import React, { useMemo, useCallback } from 'react'
import { FontVariation } from '@harness/design-system'
import { Container, TableV2, Text } from '@harness/uicore'
import { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import css from '../RuntimeInputs.module.scss'

function References({ selectedInputReferences }: { selectedInputReferences: string[] }): JSX.Element {
  const { getString } = useStrings()

  const columns: Column[] = useMemo(
    () => [
      {
        Header: getString('variableLabel'),
        id: 'variable',
        accessor: 'variable',
        width: '40%',
        Cell: cellInfo => <Text lineClamp={1}>{cellInfo.value}</Text>
      },
      {
        Header: getString('pipeline.location'),
        id: 'location',
        accessor: 'reference',
        width: '60%',
        disableSortBy: true,
        Cell: cellInfo => <Text lineClamp={1}>{cellInfo.value}</Text>
      }
    ],
    [getString]
  )

  const getInputReferenceData = useCallback(() => {
    return selectedInputReferences.map(reference => {
      const parts = reference.split('.')
      const variable = parts[parts.length - 1]
      return {
        variable,
        reference
      }
    })
  }, [selectedInputReferences])

  return selectedInputReferences?.length > 0 ? (
    <>
      <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'medium', top: 'large' }}>
        {getString('pipeline.totalVariableCount', {
          count: selectedInputReferences.length
        })}
      </Text>
      <Container className={css.referenceContainer}>
        <TableV2
          columns={columns}
          sortable
          data={getInputReferenceData()}
          name="InputReferences"
          className={css.referencesTable}
        />
      </Container>
    </>
  ) : (
    <Text font={{ variation: FontVariation.BODY2 }} padding={{ top: 'large' }}>
      {getString('common.noRefData')}
    </Text>
  )
}

export default References
