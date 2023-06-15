import { Container, Tab, Tabs, Text } from '@harness/uicore'
import React from 'react'
import { FormikContextType, useFormikContext } from 'formik'
import type { ChangeSourceDTO } from 'services/cv'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { getIsChangeSrcSectionHidden, getIsHealthSrcSectionHidden, onSave } from '../../Service.utils'
import ChangeSourceTableContainer from '../ChangeSourceTableContainer/ChangeSourceTableContainer'
import HealthSourceTableContainer from '../HealthSourceTableContainer/HealthSourceTableContainer'
import type { MonitoredServiceForm } from '../../Service.types'
import css from './CommonMonitoredServiceConfigurations.module.scss'

export interface CommonMonitoredServiceConfigurationsProps {
  config?: MonitoredServiceConfig
  identifier: string
  hideDrawer: () => void
  showDrawer: (data: ChangeSourceDTO[]) => void
  isTemplate?: boolean
  expressions?: string[]
  initialValues: MonitoredServiceForm
  onSuccess: (val: MonitoredServiceForm) => Promise<void>
  onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
  openChangeSourceDrawer: ({
    formik,
    onSuccessChangeSource
  }: {
    formik: FormikContextType<MonitoredServiceForm>
    onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
  }) => Promise<void>
}
export default function CommonMonitoredServiceConfigurations(
  props: CommonMonitoredServiceConfigurationsProps
): JSX.Element {
  const {
    config,
    identifier,
    hideDrawer,
    showDrawer,
    onSuccessChangeSource,
    openChangeSourceDrawer,
    isTemplate,
    expressions,
    initialValues,
    onSuccess
  } = props
  const formik = useFormikContext<MonitoredServiceForm>()
  const isChangeSrcSectionHidden = getIsChangeSrcSectionHidden(config, identifier)
  const isHealthSrcSectionHidden = getIsHealthSrcSectionHidden(config, identifier)

  return (
    <Container className={css.configurationTabs}>
      <Tabs id={'monitoredServiceConfigurations'} defaultSelectedTabId={'healthSource'}>
        {isHealthSrcSectionHidden ? null : (
          <Tab
            id={'healthSource'}
            title={<Text>{'Health Source'}</Text>}
            panel={
              <HealthSourceTableContainer
                healthSourceListFromAPI={initialValues.sources?.healthSources}
                serviceFormFormik={formik}
                isTemplate={isTemplate}
                expressions={expressions}
                onSave={
                  /* istanbul ignore next */ data => {
                    onSave({
                      formik: {
                        ...formik,
                        values: {
                          ...(formik?.values || {}),
                          sources: { ...formik.values?.sources, healthSources: data }
                        }
                      },
                      onSuccess
                    })
                  }
                }
              />
            }
          />
        )}
        {isChangeSrcSectionHidden ? null : (
          <Tab
            id={'changeSource'}
            title={<Text>{'Change Source'}</Text>}
            panel={
              <ChangeSourceTableContainer
                onEdit={values => {
                  showDrawer({ ...values, hideDrawer })
                }}
                onAddNewChangeSource={
                  /* istanbul ignore next */ () => {
                    openChangeSourceDrawer({ formik, onSuccessChangeSource })
                  }
                }
                value={formik.values?.sources?.changeSources}
                onSuccess={onSuccessChangeSource}
              />
            }
          />
        )}
      </Tabs>
    </Container>
  )
}
