/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, TableV2, Text } from '@harness/uicore'
import NoResultsView from '@modules/72-templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { useStrings } from 'framework/strings'
import { ChangeSourceDTO } from 'services/cv'
import { getIconBySourceType } from '@modules/85-cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'

export const ChangeSourcetable = ({ changeSources }: { changeSources?: ChangeSourceDTO[] }): JSX.Element => {
  const { getString } = useStrings()

  if (!changeSources?.length) {
    return <NoResultsView text={getString('cv.changeSource.noChangeSourceInputset')} minimal={true} />
  } else {
    return (
      <TableV2
        data={changeSources}
        columns={[
          {
            Header: getString('changeSource'),
            accessor: function accessor(row: ChangeSourceDTO) {
              return (
                <Layout.Horizontal>
                  <Icon name={getIconBySourceType(row.type || '')} padding={{ right: 'small' }} />
                  <Text lineClamp={1}>{row.identifier}</Text>
                </Layout.Horizontal>
              )
            },
            width: '50%',
            id: 'identifier'
          },
          {
            Header: 'Type',
            accessor: function accessor(row: ChangeSourceDTO) {
              return (
                <Text lineClamp={1} padding={{ right: 'small' }}>
                  {row.type}
                </Text>
              )
            },
            width: '50%',
            id: 'type'
          }
        ]}
      />
    )
  }
}
