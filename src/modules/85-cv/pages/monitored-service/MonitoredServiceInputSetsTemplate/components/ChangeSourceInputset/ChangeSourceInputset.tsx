/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { parse } from 'yaml'
import { Card, Icon, PageError, Text } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import { FontVariation, Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Failure, ResponseTemplateResponse } from 'services/template-ng'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import NoResultsView from '@modules/72-templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { ChangeSourceDTO } from 'services/cv'
import { ChangeSourcetable } from './ChangeSourcetable/ChangeSourcetable'
import {
  MonitoredServiceTemplateInterface,
  TemplateDataInterface,
  YamlResponseInterface
} from '../../MonitoredServiceInputSetsTemplate.types'
import { ChangeSourceInputsetForm } from './ChangeSourceInputsetForm/ChangeSourceInputsetForm'
import css from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.module.scss'

interface ChangeSourceInputsetProps {
  data: ResponseTemplateResponse | null
  changeSourcesWithRuntimeList: string[]
  templateRefData: TemplateDataInterface
  isReadOnlyInputSet?: boolean
  loading: boolean
  error: GetDataError<Failure | Error> | null
  refetch: () => Promise<void>
}

export const ChangeSourceInputset = ({
  templateRefData,
  isReadOnlyInputSet,
  changeSourcesWithRuntimeList,
  data: msTemplateResponse,
  loading: msTemplateLoading,
  error: msTemplateError,
  refetch: msTemplateRefetch
}: ChangeSourceInputsetProps): JSX.Element => {
  const { getString } = useStrings()
  const [monitoredServiceYaml, setMonitoredServiceYaml] = React.useState<MonitoredServiceTemplateInterface>()

  useEffect(() => {
    msTemplateRefetch()
  }, [templateRefData?.identifier, templateRefData?.versionLabel])

  const changeSources = monitoredServiceYaml?.spec?.sources?.changeSources

  // Set complete Yaml as state variable
  React.useEffect(() => {
    if (msTemplateResponse && msTemplateResponse?.data?.yaml) {
      const yaml = parse(msTemplateResponse?.data?.yaml) as YamlResponseInterface
      const filteredChangeSourceList = yaml?.template?.spec?.sources?.changeSources?.filter((i: ChangeSourceDTO) =>
        changeSourcesWithRuntimeList?.includes(i.identifier || '')
      )
      const filteredTemplate = {
        ...yaml?.template,
        spec: {
          ...yaml?.template.spec,
          sources: {
            ...yaml?.template?.spec?.sources,
            changeSources: filteredChangeSourceList
          }
        }
      } as MonitoredServiceTemplateInterface
      setMonitoredServiceYaml(filteredTemplate)
    }
  }, [msTemplateResponse])

  let content = <></>
  if (msTemplateLoading) {
    content = <Icon name="spinner" />
  } else if (msTemplateError) {
    content = <PageError message={getErrorMessage(msTemplateError)} onClick={() => msTemplateRefetch()} />
  } else if (isEmpty(monitoredServiceYaml)) {
    content = <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
  } else if (!isEmpty(monitoredServiceYaml)) {
    content = (
      <>
        <ChangeSourcetable changeSources={changeSources} />
        <ChangeSourceInputsetForm changeSources={changeSources} isReadOnlyInputSet={isReadOnlyInputSet} />
      </>
    )
  }
  return (
    <Card className={css.cardStyle}>
      <Text
        font={{ variation: FontVariation.CARD_TITLE }}
        color={Color.BLACK}
        style={{ paddingBottom: 'var(--spacing-medium)' }}
      >
        {getString('changeSource')}
      </Text>
      {content}
    </Card>
  )
}
