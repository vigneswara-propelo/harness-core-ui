/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, IDrawerProps } from '@blueprintjs/core'
import { Formik } from 'formik'
import { FormikForm, Button, Layout, ButtonVariation, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ServiceOverridesFilterFormType } from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/filterUtils'
import ServiceOverrideFilterForm from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFilterForm'

import css from './ServiceOverrideFilter.module.scss'

export interface ServiceOverrideFilterProps {
  initialFilter: { formValues: ServiceOverridesFilterFormType }
  onApply: (formData: ServiceOverridesFilterFormType) => void
  onClose: () => void
  onClear: () => void
  isOpen: boolean
  environments: SelectOption[]
  services: SelectOption[]
  infrastructures: SelectOption[]
}

export const ServiceOverrideFilter = (props: ServiceOverrideFilterProps): JSX.Element => {
  const { onApply, onClose, initialFilter, onClear, isOpen, environments, infrastructures, services } = props
  const { getString } = useStrings()

  const defaultPageDrawerProps: IDrawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    isOpen,
    size: 700,
    position: 'right'
  }

  return (
    <Drawer {...defaultPageDrawerProps} onClose={onClose}>
      <Button
        minimal
        className={css.filterDrawerCloseButton}
        icon="cross"
        withoutBoxShadow
        onClick={onClose}
        data-testid="filter-drawer-close"
      />
      <Formik<ServiceOverridesFilterFormType>
        onSubmit={onApply}
        initialValues={initialFilter.formValues}
        enableReinitialize={true}
      >
        {formik => {
          return (
            <FormikForm>
              <div className={css.main}>
                <section className={css.formSection}>
                  <Layout.Vertical spacing="large" padding="xlarge" height="100vh">
                    <Layout.Horizontal spacing="small" className={css.titleLayout}>
                      <div className={css.title}>{getString('cd.overridesFilter')}</div>
                    </Layout.Horizontal>
                    <Layout.Vertical className={css.layout} padding={{ top: 'medium' }}>
                      <div className={css.fieldsContainer}>
                        <ServiceOverrideFilterForm
                          environments={environments}
                          services={services}
                          infrastructures={infrastructures}
                        />
                      </div>
                      <Layout.Horizontal spacing={'medium'}>
                        <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('filters.apply')} />
                        <Button
                          variation={ButtonVariation.TERTIARY}
                          type={'reset'}
                          intent={'none'}
                          text={getString('filters.clearAll')}
                          onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                            event.preventDefault()
                            onClear()
                            formik.setValues({} as ServiceOverridesFilterFormType)
                          }}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  </Layout.Vertical>
                </section>
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </Drawer>
  )
}
