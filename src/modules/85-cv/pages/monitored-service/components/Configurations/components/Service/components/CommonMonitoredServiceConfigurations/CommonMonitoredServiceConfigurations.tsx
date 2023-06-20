import { Container, Tab, Tabs, Text } from '@harness/uicore'
import React from 'react'
import { FormikContextType, useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import type { ChangeSourceDTO, MonitoredServiceDTO } from 'services/cv'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import SaveAndDiscardButton from '@cv/components/SaveAndDiscardButton/SaveAndDiscardButton'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { isUpdated } from '@cv/pages/monitored-service/components/Configurations/Configurations.utils'
import { useStrings } from 'framework/strings'
import {
  getIsChangeSrcSectionHidden,
  getIsHealthSrcSectionHidden,
  onSave,
  updateMonitoredServiceDTOOnTypeChange
} from '../../Service.utils'
import ChangeSourceTableContainer from '../ChangeSourceTableContainer/ChangeSourceTableContainer'
import HealthSourceTableContainer from '../HealthSourceTableContainer/HealthSourceTableContainer'
import type { MonitoredServiceForm } from '../../Service.types'
import MonitoredServiceOverview from '../MonitoredServiceOverview/MonitoredServiceOverview'
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
  isEdit: boolean
  onChangeMonitoredServiceType: (updatedValues: MonitoredServiceForm) => void
  cachedInitialValues?: MonitoredServiceForm | null
  onDiscard?: () => void
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
    onSuccess,
    isEdit,
    onChangeMonitoredServiceType,
    cachedInitialValues,
    onDiscard
  } = props
  const formik = useFormikContext<MonitoredServiceForm>()
  const isChangeSrcSectionHidden = getIsChangeSrcSectionHidden(config, identifier)
  const isHealthSrcSectionHidden = getIsHealthSrcSectionHidden(config, identifier)
  const { projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()

  const handleMonitoredServiceTypeChange = (type: MonitoredServiceDTO['type']): void => {
    if (type === formik.values.type) {
      return
    }
    formik.setFieldValue('type', type)
    onChangeMonitoredServiceType({
      isEdit,
      ...updateMonitoredServiceDTOOnTypeChange(type, formik.values)
    })
  }

  return (
    <Container className={css.configurationTabs}>
      <Tabs id={'monitoredServiceConfigurations'} defaultSelectedTabId={'monitoredServiceOverview'}>
        <Tab
          id="monitoredServiceOverview"
          title={<Text>{getString('overview')}</Text>}
          panel={
            <>
              <Container className={css.saveDiscardButton}>
                <SaveAndDiscardButton
                  isUpdated={isUpdated(formik.dirty, initialValues, cachedInitialValues)}
                  onSave={() => onSave({ formik, onSuccess })}
                  onDiscard={() => {
                    formik.resetForm()
                    onDiscard?.()
                  }}
                  RbacPermission={{
                    permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                    resource: {
                      resourceType: ResourceType.MONITOREDSERVICE,
                      resourceIdentifier: projectIdentifier
                    }
                  }}
                />
              </Container>
              <MonitoredServiceOverview
                formikProps={formik}
                isEdit={isEdit}
                onChangeMonitoredServiceType={handleMonitoredServiceTypeChange}
                config={config}
              />
            </>
          }
        />
        {isHealthSrcSectionHidden ? null : (
          <Tab
            id={'healthSource'}
            title={<Text>{getString('pipeline.verification.healthSourceLabel')}</Text>}
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
            title={<Text>{getString('changeSource')}</Text>}
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
