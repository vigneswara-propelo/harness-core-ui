/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Container, FormikForm, FormInput, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { FIELD_KEYS, FreezeWindowLevels, ResourcesInterface } from '@freeze-windows/types'
import { FieldVisibility, isAllOptionSelected } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { ServiceField } from './FreezeServiceFieldRenderer'
import { EnvironmentField } from './FreezeEnvironmentFieldRenderer'
import {
  EnvironmentTypeRenderer,
  Organizationfield,
  PipelineField,
  ProjectField
} from './FreezeStudioConfigSectionRenderers'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface ConfigEditModeRendererProps {
  index: number
  getString: UseStringsReturn['getString']
  formikProps: any
  resources: ResourcesInterface
  saveEntity: any
  setVisualView: () => void
  fieldsVisibility: FieldVisibility
}

const showErrorFn = (values: any, freezeWindowLevel: FreezeWindowLevels): boolean => {
  const serviceValue = get(values, FIELD_KEYS.Service)?.length
  const envValue = get(values, FIELD_KEYS.Environment)?.length
  const projValue = get(values, FIELD_KEYS.Proj)?.length
  const orgValue = get(values, FIELD_KEYS.Org)?.length
  const pipelineValue = get(values, FIELD_KEYS.Pipeline)?.length

  if (freezeWindowLevel === FreezeWindowLevels.ORG) {
    if (!serviceValue && !envValue && !projValue) {
      return true
    }
  }

  if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
    if (!serviceValue && !envValue && (!orgValue || !projValue)) {
      return true
    }
  }

  if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
    if (!serviceValue && !envValue && !pipelineValue) {
      return true
    }
  }

  return false
}

export const ConfigEditModeRenderer: React.FC<ConfigEditModeRendererProps> = ({
  index,
  getString,
  formikProps,
  resources,
  saveEntity,
  setVisualView,
  fieldsVisibility
}) => {
  const serviceEntityPath = `entity[${index}].${FIELD_KEYS.Service}`
  const envEntityPath = `entity[${index}].${FIELD_KEYS.Environment}`

  const visibleOnlyAtProject = resources.freezeWindowLevel === FreezeWindowLevels.PROJECT

  const [showError, setShowError] = React.useState(false)

  const [allServiceChecked, setAllServicesChecked] = React.useState<boolean | undefined>()
  const [allEnvChecked, setAllEnvChecked] = React.useState<boolean | undefined>()
  const [envTypeFilter, setEnvTypeFilter] = React.useState<('PreProduction' | 'Production')[] | undefined>([
    'PreProduction',
    'Production'
  ])

  React.useEffect(() => {
    setAllEnvChecked(isAllOptionSelected(get(formikProps.values, envEntityPath)))
    setAllServicesChecked(isAllOptionSelected(get(formikProps.values, serviceEntityPath)))
    const currentEnvType = get(formikProps.values, `entity[${index}].${FIELD_KEYS.EnvType}`)
    setEnvTypeFilter(currentEnvType === 'All' ? ['PreProduction', 'Production'] : [currentEnvType])
    setShowError(showErrorFn(formikProps.values?.entity?.[index], fieldsVisibility.freezeWindowLevel))
  }, [formikProps.values])

  const scopeBasedErrorMsg =
    resources.freezeWindowLevel === FreezeWindowLevels.ACCOUNT
      ? getString('freezeWindows.freezeWindowConfig.accountLevelValidationMsg')
      : getString('freezeWindows.freezeWindowConfig.orgLevelValidationMsg')

  return (
    <FormikForm>
      <Layout.Vertical data-testid={`config-edit-mode_${index}`}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
          <FormInput.Text
            name={`entity[${index}].name`}
            label={getString('name')}
            inputGroup={{ autoFocus: true }}
            style={{ width: 400 }}
          />
          <Layout.Horizontal spacing="small">
            <Button icon="tick" minimal withoutCurrentColor className={css.tickButton} onClick={saveEntity} />
            <Button icon="cross" minimal withoutCurrentColor className={css.crossButton} onClick={setVisualView} />
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Layout.Vertical>
          {!visibleOnlyAtProject && (
            <>
              {showError && (
                <Text font={{ variation: FontVariation.FORM_MESSAGE_DANGER }} margin={{ top: 'medium' }}>
                  {scopeBasedErrorMsg}
                </Text>
              )}
              <hr className={css.separator} />
              <Layout.Vertical>
                <ServiceField
                  index={index}
                  getString={getString}
                  formikProps={formikProps}
                  allServiceChecked={allServiceChecked}
                  setAllServicesChecked={setAllServicesChecked}
                />
                <EnvironmentField
                  visibleOnlyAtProject={visibleOnlyAtProject}
                  setEnvTypeFilter={setEnvTypeFilter}
                  envTypeFilter={envTypeFilter}
                  index={index}
                  getString={getString}
                  formikProps={formikProps}
                  allEnvChecked={allEnvChecked}
                  setAllEnvChecked={setAllEnvChecked}
                />
              </Layout.Vertical>
              <hr className={css.separator} />
            </>
          )}
          <Layout.Vertical width={'400px'}>
            {fieldsVisibility.showOrgField ? (
              <Organizationfield
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                setFieldValue={formikProps.setFieldValue}
                formikValues={formikProps.values}
                setValues={formikProps.setValues}
                organizations={resources.orgs || []}
                fetchProjectsForOrgId={resources.fetchProjectsForOrgId}
                fetchOrgByQuery={resources.fetchOrgByQuery}
                loadingOrgs={resources.loadingOrgs}
                fetchOrgResetQuery={resources.fetchOrgResetQuery}
              />
            ) : null}
            {fieldsVisibility.showProjectField ? (
              <ProjectField
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                formikValues={formikProps.values}
                setValues={formikProps.setValues}
                setFieldValue={formikProps.setFieldValue}
                resources={resources}
                fetchProjectsByQuery={resources.fetchProjectsByQuery}
                loadingProjects={resources.loadingProjects}
                fetchProjectsResetQuery={resources.fetchProjectsResetQuery}
              />
            ) : null}
          </Layout.Vertical>
        </Layout.Vertical>
        {visibleOnlyAtProject && (
          <>
            {showError && (
              <Text font={{ variation: FontVariation.FORM_MESSAGE_DANGER }} margin={{ top: 'medium' }}>
                {getString('freezeWindows.freezeWindowConfig.projLevelValidationMsg')}
              </Text>
            )}
            <hr className={css.separator} />
          </>
        )}
        <Layout.Vertical>
          {visibleOnlyAtProject && (
            <ServiceField
              index={index}
              getString={getString}
              formikProps={formikProps}
              allServiceChecked={allServiceChecked}
              setAllServicesChecked={setAllServicesChecked}
            />
          )}
          <Layout.Horizontal spacing="medium">
            {!visibleOnlyAtProject && (
              <FormInput.Select
                name={'projectServices'}
                items={[{ label: getString('common.allServices'), value: 'All' }]}
                disabled={true}
                placeholder={getString('common.allServices')}
                label={getString('services')}
                style={{ width: '400px' }}
              />
            )}
            {!visibleOnlyAtProject && (
              <EnvironmentTypeRenderer
                getString={getString}
                name={`entity[${index}].${FIELD_KEYS.EnvType}`}
                setEnvTypeFilter={setEnvTypeFilter}
              />
            )}
            {visibleOnlyAtProject && (
              <EnvironmentField
                visibleOnlyAtProject={visibleOnlyAtProject}
                envTypeFilter={envTypeFilter}
                setEnvTypeFilter={setEnvTypeFilter}
                index={index}
                getString={getString}
                formikProps={formikProps}
                allEnvChecked={allEnvChecked}
                setAllEnvChecked={setAllEnvChecked}
              />
            )}
          </Layout.Horizontal>

          <Container width={'400px'}>
            {fieldsVisibility.showPipelineField ? (
              <PipelineField
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                formikValues={formikProps.values}
                setValues={formikProps.setValues}
                setFieldValue={formikProps.setFieldValue}
                resources={resources}
                fetchPipelinesByQuery={resources.fetchPipelinesByQuery}
                loadingPipelines={resources.loadingPipelines}
                fetchPipelinesResetQuery={resources.fetchPipelinesResetQuery}
              />
            ) : null}
          </Container>
        </Layout.Vertical>
      </Layout.Vertical>
    </FormikForm>
  )
}
