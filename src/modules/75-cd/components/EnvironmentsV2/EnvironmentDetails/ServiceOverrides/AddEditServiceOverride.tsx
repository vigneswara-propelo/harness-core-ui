/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import cx from 'classnames'
import {
  Button,
  Formik,
  Layout,
  FormInput,
  ButtonVariation,
  SelectOption,
  Text,
  Container,
  VisualYamlToggle,
  VisualYamlSelectedView as SelectedView,
  useToaster,
  Tabs,
  Tab
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ManifestConfigWrapper,
  NGServiceConfig,
  NGServiceOverrideConfig,
  ServiceOverrideResponseDTO,
  ServiceResponse,
  useUpsertServiceOverride
} from 'services/cd-ng'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { EnvironmentPathProps, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import ServiceVariableOverride from './ServiceVariableOverride'
import ServiceManifestOverride from './ServiceManifestOverride/ServiceManifestOverride'
import { ServiceOverrideTab } from './ServiceOverridesUtils'
import type { AddEditServiceOverrideFormProps, VariableOverride } from './ServiceOverridesInterface'
import css from './ServiceOverrides.module.scss'

export interface AddEditServiceOverrideProps {
  selectedService: string | null
  services: ServiceResponse[]
  serviceOverrides?: ServiceOverrideResponseDTO[] | null
  closeModal: (updateServiceOverride?: boolean) => void
  defaultTab: string
  isReadonly: boolean
  expressions: string[]
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `serviceOverrides.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 350,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export default function AddEditServiceOverride({
  selectedService,
  services,
  closeModal,
  serviceOverrides,
  defaultTab,
  isReadonly,
  expressions
}: AddEditServiceOverrideProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    PipelinePathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const formikRef = useRef<FormikProps<AddEditServiceOverrideFormProps>>()
  const isServiceManifestEnabled = useFeatureFlag(FeatureFlag.NG_SERVICE_MANIFEST_OVERRIDE)

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [isModified, setIsModified] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState(defaultTo(defaultTab, ServiceOverrideTab.VARIABLE))

  const selectedServiceOverride = serviceOverrides?.find(
    svcOverride => svcOverride.serviceRef === defaultTo(selectedService, formikRef.current?.values.serviceRef)
  )
  const getVariableOptions = (): SelectOption[] => {
    if (!isEmpty(selectedService)) {
      const serviceSelected = services.find(serviceObj => serviceObj.service?.identifier === selectedService)
      if (serviceSelected) {
        const parsedServiceYaml = yamlParse<NGServiceConfig>(defaultTo(serviceSelected?.service?.yaml, '')).service
        const serviceVars = defaultTo(parsedServiceYaml?.serviceDefinition?.spec?.variables, [])
        return serviceVars?.map(variable => ({
          label: defaultTo(variable.name, ''),
          value: defaultTo(variable.name, '')
        }))
      }
    }
    return []
  }
  const [variablesOptions, setVariablesOptions] = useState<SelectOption[]>(getVariableOptions())

  const servicesOptions = useMemo(() => {
    return services.map(item => ({
      label: defaultTo(item.service?.name, ''),
      value: defaultTo(item.service?.identifier, '')
    }))
  }, [services])

  const { mutate: upsertServiceOverride, loading: upsertServiceOverrideLoading } = useUpsertServiceOverride({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleServiceChange = (item: SelectOption): void => {
    const serviceSelected = services.find(serviceObj => serviceObj.service?.identifier === item.value)
    const serviceOverride = serviceOverrides?.find(svcOverride => svcOverride.serviceRef === item.value)

    const selectedSvcVariable = !isEmpty(serviceOverride) ? getVariablesOverrideInitialValue(serviceOverride) : []
    formikRef.current?.setFieldValue('variables', selectedSvcVariable)

    const selectedSvcManifest = !isEmpty(serviceOverride) ? getManifestOverrideObject(serviceOverride) : []
    formikRef.current?.setFieldValue('manifests', selectedSvcManifest)

    // istanbul ignore else
    if (serviceSelected) {
      const parsedServiceYaml = defaultTo(
        yamlParse(defaultTo(serviceSelected?.service?.yaml, '{}')),
        ''
      ) as NGServiceConfig
      const serviceVars = defaultTo(parsedServiceYaml?.service?.serviceDefinition?.spec?.variables, [])
      setVariablesOptions(
        defaultTo(
          serviceVars?.map(variable => ({
            label: defaultTo(variable.name, ''),
            value: defaultTo(variable.name, '')
          })),
          []
        )
      )
    }
  }

  const handleModeSwitch = useCallback(
    /* istanbul ignore next */ (view: SelectedView) => {
      if (view === SelectedView.YAML && !formikRef.current?.values?.serviceRef) {
        showError('Please select a service first')
        return
      }
      setSelectedView(view)
    },
    [showError]
  )

  /**********************************************Service Variable CRUD Operations ************************************************/
  const getVariablesOverrideInitialValue = (svcOverride?: ServiceOverrideResponseDTO): Array<VariableOverride> => {
    const serviceOverrideData = defaultTo(svcOverride, selectedServiceOverride)
    if (!isEmpty(serviceOverrideData)) {
      const parsedServiceOverride = yamlParse<NGServiceOverrideConfig>(
        defaultTo(serviceOverrideData?.yaml, '')
      ).serviceOverrides
      return defaultTo(parsedServiceOverride?.variables, []) as VariableOverride[]
    }
    return []
  }
  const getVariablesOverrideValues = (): Array<VariableOverride> => {
    const formikManifestOverrideData = formikRef.current?.values.variables
    if (formikManifestOverrideData?.length) {
      return formikManifestOverrideData
    }
    return getVariablesOverrideInitialValue()
  }

  const getVariablesOverrideFormdata = (values: AddEditServiceOverrideFormProps): VariableOverride[] | undefined => {
    if (selectedView === SelectedView.YAML) {
      return values.variables
    }
    return !isEmpty(formikRef.current?.values.variables) ? formikRef.current?.values.variables : undefined
  }

  const handleVariableOverrideSubmit = useCallback((variableObj: VariableOverride, variableIndex: number): void => {
    const variableDefaultValue = [...(formikRef.current?.values?.variables as VariableOverride[])]
    if (variableDefaultValue?.length) {
      variableDefaultValue.splice(variableIndex, 1, variableObj)
    } else {
      variableDefaultValue.push(variableObj)
    }
    formikRef.current?.setFieldValue('variables', variableDefaultValue)
  }, [])

  const onServiceVarDelete = useCallback((index: number): void => {
    const variableDefaultValues = [...(formikRef.current?.values?.variables as VariableOverride[])]
    variableDefaultValues.splice(index, 1)
    formikRef.current?.setFieldValue('variables', variableDefaultValues)
  }, [])
  /**********************************************Service Variable CRUD Operations ************************************************/

  /**********************************************Service Manifest CRUD Operations ************************************************/
  const getManifestOverrideObject = (svcOverride?: ServiceOverrideResponseDTO): Array<ManifestConfigWrapper> => {
    const serviceOverrideData = defaultTo(svcOverride, selectedServiceOverride)
    if (!isEmpty(serviceOverrideData)) {
      const parsedServiceOverride = yamlParse<NGServiceOverrideConfig>(
        defaultTo(serviceOverrideData?.yaml, '')
      ).serviceOverrides
      return defaultTo(parsedServiceOverride?.manifests, []) as ManifestConfigWrapper[]
    }
    return []
  }

  const getManifestOverrideValues = (): Array<ManifestConfigWrapper> => {
    const formikManifestOverrideData = formikRef.current?.values.manifests
    if (formikManifestOverrideData?.length) {
      return formikManifestOverrideData
    }
    return getManifestOverrideObject()
  }

  const getManifestOverrideFormdata = (
    values: AddEditServiceOverrideFormProps
  ): ManifestConfigWrapper[] | undefined => {
    if (selectedView === SelectedView.YAML) {
      return values.manifests
    }
    return !isEmpty(formikRef.current?.values.manifests) ? formikRef.current?.values.manifests : undefined
  }

  const handleManifestOverrideSubmit = useCallback(
    (manifestObj: ManifestConfigWrapper, manifestIndex: number): void => {
      const manifestDefaultValue = [...(formikRef.current?.values?.manifests as ManifestConfigWrapper[])]
      if (manifestDefaultValue?.length) {
        manifestDefaultValue.splice(manifestIndex, 1, manifestObj)
      } else {
        manifestDefaultValue.push(manifestObj)
      }
      formikRef.current?.setFieldValue('manifests', manifestDefaultValue)
    },
    []
  )

  const removeManifestConfig = useCallback((index: number): void => {
    const manifestDefaultValue = [...(formikRef.current?.values?.manifests as ManifestConfigWrapper[])]
    manifestDefaultValue.splice(index, 1)
    formikRef.current?.setFieldValue('manifests', manifestDefaultValue)
  }, [])
  /**********************************************Service Manifest CRUD Operations ************************************************/

  const onSubmit = async (values: AddEditServiceOverrideFormProps): Promise<void> => {
    try {
      const response = await upsertServiceOverride({
        environmentIdentifier,
        serviceIdentifier: values.serviceRef as string,
        orgIdentifier,
        projectIdentifier,
        yaml: yamlStringify({
          serviceOverrides: {
            environmentRef: environmentIdentifier,
            serviceRef: values.serviceRef,
            variables: getVariablesOverrideFormdata(values),
            manifests: getManifestOverrideFormdata(values)
          }
        } as NGServiceOverrideConfig)
      })

      if (response.status === 'SUCCESS') {
        closeModal(true)
      } else {
        throw response
      }
    } catch (e) {
      showError(getRBACErrorMessage(e))
    }
  }

  const existingJSON = useMemo(() => {
    return {
      serviceOverrides: {
        environmentRef: environmentIdentifier,
        serviceRef: formikRef.current?.values.serviceRef,
        variables: getVariablesOverrideValues(),
        manifests: getManifestOverrideValues()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef.current])

  const handleYamlChange = useCallback((): void => {
    const parsedYaml = parse(defaultTo(yamlHandler?.getLatestYaml(), '{}'))
    if (isEqual(existingJSON, parsedYaml)) {
      setIsModified(false)
    } else {
      setIsModified(true)
    }
  }, [existingJSON, yamlHandler])

  const handleTabChange = (nextTab: ServiceOverrideTab): void => {
    setSelectedTab(nextTab)
  }

  const isSubmitBtnDisabled = (): boolean => {
    if (upsertServiceOverrideLoading) {
      return true
    }
    if (selectedView === SelectedView.YAML) {
      return !isModified
    } else {
      if (formikRef.current) {
        if (selectedTab === ServiceOverrideTab.VARIABLE) {
          return !(Array.isArray(formikRef.current?.values.variables) && formikRef.current.values.variables.length > 0)
        } else if (selectedTab === ServiceOverrideTab.MANIFEST) {
          return !(Array.isArray(formikRef.current?.values.manifests) && formikRef.current.values.manifests.length > 0)
        }
      }
      return false
    }
  }

  return (
    <Formik<AddEditServiceOverrideFormProps>
      formName="addEditServiceOverrideForm"
      initialValues={{
        serviceRef: selectedService,
        environmentRef: environmentIdentifier,
        variables: getVariablesOverrideInitialValue(),
        manifests: getManifestOverrideObject()
      }}
      onSubmit={
        /* istanbul ignore next */ values => {
          onSubmit?.({
            ...values
          })
        }
      }
    >
      {formikProps => {
        formikRef.current = formikProps
        return (
          <div
            className={cx({
              [css.serviceOverrideDialog]: isEmpty(selectedService)
            })}
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'medium' }}>
              <VisualYamlToggle
                selectedView={selectedView}
                onChange={nextMode => {
                  handleModeSwitch(nextMode)
                }}
              />
            </Layout.Horizontal>
            {selectedView === SelectedView.VISUAL ? (
              <Container>
                <FormInput.Select
                  name="serviceRef"
                  items={servicesOptions}
                  label={getString('service')}
                  placeholder={getString('common.selectName', { name: getString('service') })}
                  onChange={item => handleServiceChange(item)}
                  disabled={!isEmpty(selectedService)}
                />
                {!isEmpty(formikProps.values?.serviceRef) && (
                  <>
                    <Text>{getString('cd.overrideType')}</Text>
                    <Tabs id="serviceOverrideTab" selectedTabId={selectedTab} onChange={handleTabChange}>
                      <Tab
                        id={ServiceOverrideTab.VARIABLE}
                        title={getString('variableLabel')}
                        panel={
                          <ServiceVariableOverride
                            variableOverrides={defaultTo(formikProps.values?.variables, [])}
                            variablesOptions={variablesOptions}
                            handleVariableSubmit={handleVariableOverrideSubmit}
                            isReadonly={isReadonly}
                            onServiceVarDelete={onServiceVarDelete}
                          />
                        }
                      />
                      {isServiceManifestEnabled && (
                        <Tab
                          id={ServiceOverrideTab.MANIFEST}
                          title={getString('manifestsText')}
                          panel={
                            <ServiceManifestOverride
                              manifestOverrides={
                                defaultTo(formikProps.values?.manifests, []) as ManifestConfigWrapper[]
                              }
                              handleManifestOverrideSubmit={handleManifestOverrideSubmit}
                              removeManifestConfig={removeManifestConfig}
                              isReadonly={isReadonly}
                              expressions={expressions}
                            />
                          }
                        />
                      )}
                    </Tabs>
                  </>
                )}
              </Container>
            ) : (
              <YAMLBuilder
                {...yamlBuilderReadOnlyModeProps}
                existingJSON={existingJSON}
                bind={setYamlHandler}
                showSnippetSection={false}
                onChange={handleYamlChange}
              />
            )}
            <Layout.Horizontal spacing="medium" padding={{ top: 'medium' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                onClick={
                  /* istanbul ignore next */ () => {
                    if (selectedView === SelectedView.YAML) {
                      const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                      onSubmit(parse(latestYaml)?.serviceOverrides)
                    } else {
                      formikProps.submitForm()
                    }
                  }
                }
                data-testid="addVariableSave"
                disabled={isSubmitBtnDisabled()}
              />
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => closeModal()}
                data-testid="addVariableCancel"
                disabled={upsertServiceOverrideLoading}
              />
            </Layout.Horizontal>
          </div>
        )
      }}
    </Formik>
  )
}
