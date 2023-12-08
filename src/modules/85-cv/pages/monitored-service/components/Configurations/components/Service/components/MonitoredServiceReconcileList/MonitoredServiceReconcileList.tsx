/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, TableV2, Page } from '@harness/uicore'
import type { CellProps } from 'react-table'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { MonitoredServiceReference, useGetMonitoredServiceReconciliationStatuses } from 'services/cv'
import { NGTemplateInfoConfig } from 'services/template-ng'
import { useStrings } from 'framework/strings'

import {
  RenderOrg,
  RenderProject
} from '@modules/85-cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.utils'
import { TemplateContext } from '@modules/72-templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import NoResultsView from '@modules/72-templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import {
  RenderAccount,
  RenderLastReconciled,
  RenderReconciliationStatus,
  RenderMonitoredServiceIdentifier,
  RenderActionButtons
} from './MonitoredServiceReconcileList.utils'
import useReconcileDrawer from './useReconcileDrawer'
import css from './MonitoredServiceReconcileList.module.scss'

const MonitoredServiceReconcileList = ({ templateValue }: { templateValue: NGTemplateInfoConfig }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const [pageNumber, setPageNumber] = useState(0)
  const { openInputsetModal } = useReconcileDrawer()

  const tempcontext = React.useContext(TemplateContext)

  const { versionLabel, identifier, orgIdentifier = '', projectIdentifier = '' } = templateValue
  const queryParams = {
    accountId,
    orgIdentifier,
    projectIdentifier,
    templateIdentifier: identifier,
    versionLabel,
    pageNumber,
    pageSize: 10
  }

  const { data, loading, error, refetch } = useGetMonitoredServiceReconciliationStatuses({ queryParams })
  const { content, totalItems = 0, totalPages = 0, pageIndex = 0, pageSize = 10 } = data?.resource || {}

  const columns = [
    {
      Header: getString('cv.monitoredServices.ReconcileTab.monitoredServiceIdentifier'),
      width: '15%',
      Cell: RenderMonitoredServiceIdentifier
    },
    { Header: getString('projectLabel').toUpperCase(), Cell: RenderProject },
    { Header: getString('orgLabel').toUpperCase(), Cell: RenderOrg },
    { Header: getString('account').toUpperCase(), Cell: RenderAccount, width: '15%' },
    { Header: getString('cv.monitoredServices.ReconcileTab.lastReconciled'), width: '15%', Cell: RenderLastReconciled },
    { Header: getString('status'), Cell: RenderReconciliationStatus, width: '15%' },
    {
      id: 'reconcile',
      width: '18%',
      Cell: (props: CellProps<MonitoredServiceReference>) => (
        <RenderActionButtons
          {...props}
          refetch={refetch}
          tempcontext={tempcontext}
          versionLabel={versionLabel}
          templateIdentifier={identifier}
          openInputsetModal={openInputsetModal}
        />
      )
    }
  ]

  return (
    <Page.Body loading={loading} error={getErrorMessage(error)} retryOnError={() => refetch()}>
      <Container margin="large">
        {content?.length ? (
          <TableV2
            className={css.reconciletable}
            sortable
            columns={columns}
            data={(content || []) as MonitoredServiceReference[]}
            pagination={{
              pageSize,
              pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: setPageNumber
            }}
          />
        ) : (
          <Container padding="xxxlarge">
            <NoResultsView minimal={true} text={getString('cv.monitoredServices.ReconcileTab.noLinkedMS')} />
          </Container>
        )}
      </Container>
    </Page.Body>
  )
}

export default MonitoredServiceReconcileList
