/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, Tab, Tabs } from '@harness/uicore'
import { FormikProps } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { AdvancedStepsWithRef } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import StepGroupVariables from '@pipeline/components/PipelineSteps/Steps/StepGroupStep/StepGroupVariablesSelection/StepGroupVariables'
import { StepCommandsProps, Values } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/strings'
import { NGVariable, StepGroupElementConfig } from 'services/cd-ng'
import { StepGroupFormikValues } from '@pipeline/components/PipelineSteps/Steps/StepGroupStep/StepGroupUtil'
import { StepCommandsRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import css from './StepGroupTemplateForm.module.scss'

interface StepGroupTemplateConfigFormikValues {
  variables?: NGVariable[]
}

export enum StepCommandTabs {
  StepConfiguration = 'StepConfiguration',
  Advanced = 'Advanced'
}

export function StepGroupTemplateCommands(props: StepCommandsProps, ref: StepCommandsRef): React.ReactElement {
  const {
    step,
    onChange,
    isReadonly,
    stepsFactory,
    allowableTypes,
    isRollback = false,
    isProvisionerStep = false
  } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepCommandTabs.Advanced)

  const stepRef = React.useRef<FormikProps<unknown> | null>(null)
  const advancedConfRef = React.useRef<FormikProps<unknown> | null>(null)

  /* istanbul ignore next */ async function handleTabChange(
    newTab: StepCommandTabs,
    prevTab: StepCommandTabs
  ): Promise<void> {
    if (prevTab === StepCommandTabs.StepConfiguration && stepRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await stepRef.current.submitForm()

      if (isEmpty(stepRef.current.errors)) {
        setActiveTab(newTab)
      }
    } else if (prevTab === StepCommandTabs.Advanced && advancedConfRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await advancedConfRef.current.submitForm()

      if (isEmpty(advancedConfRef.current.errors)) {
        setActiveTab(newTab)
      }
    }
  }

  const getValues = (
    latestValues: {
      stepValues?: Partial<Values>
      advancedValues?: Partial<Values>
    } = {}
  ): Partial<Values> => {
    const { stepValues, advancedValues } = latestValues
    const values = {
      ...(stepRef.current ? stepValues ?? (stepRef.current?.values as Partial<Values>) : {}),
      ...defaultTo(advancedValues, advancedConfRef.current?.values as Partial<Values>)
    }
    return values
  }

  /* istanbul ignore next */ React.useImperativeHandle(ref, () => ({
    setFieldError(fieldName: string, error: string) {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        stepRef.current.setFieldError(fieldName, error)
      }
    },
    isDirty() {
      // For variables support not needed, can be added in future if needed for other fields support
      return false
    },
    async submitForm() {
      await stepRef.current?.submitForm()
      await advancedConfRef.current?.submitForm()
    },
    getErrors() {
      return {
        ...stepRef.current?.errors,
        ...advancedConfRef.current?.errors
      }
    },
    getValues,
    resetForm() {
      stepRef.current?.resetForm?.()
      advancedConfRef.current?.resetForm?.()
    }
  }))

  const getStepWidgetWithFormikRef = (): JSX.Element => {
    return (
      <Formik<StepGroupTemplateConfigFormikValues>
        initialValues={{
          variables: (step as StepGroupElementConfig)?.variables
        }}
        onSubmit={
          /* istanbul ignore next */ (values: StepGroupTemplateConfigFormikValues) => {
            onChange?.(getValues({ stepValues: values }))
          }
        }
        validate={formValues => {
          onChange?.(getValues({ stepValues: formValues }))
        }}
        formName="stepGroupTemplateConfiguration"
      >
        {(formik: FormikProps<StepGroupTemplateConfigFormikValues>) => {
          setFormikRef(stepRef, formik)

          return (
            <StepGroupVariables
              allowableTypes={allowableTypes}
              formikRef={formik as unknown as FormikProps<StepGroupFormikValues>}
              readonly={isReadonly}
              isRollback={isRollback}
              isProvisionerStep={isProvisionerStep}
            />
          )
        }}
      </Formik>
    )
  }

  return (
    <Tabs id="step-commands" selectedTabId={activeTab} onChange={handleTabChange} renderAllTabPanels>
      <Tab
        id={StepCommandTabs.StepConfiguration}
        title={getString('stepGroupConfiguration')}
        panel={getStepWidgetWithFormikRef()}
        panelClassName={css.stepGroupConfigPanel}
      />
      <Tab
        id={StepCommandTabs.Advanced}
        title={getString('advancedTitle')}
        panel={
          <AdvancedStepsWithRef
            helpPanelVisible
            step={step as StepGroupElementConfig}
            isReadonly={isReadonly}
            stepsFactory={stepsFactory}
            allowableTypes={allowableTypes}
            onChange={values => {
              onChange?.(getValues({ advancedValues: values }))
            }}
            isStepGroup={true}
            ref={advancedConfRef}
            stepType={StepType.StepGroup}
          />
        }
      />
    </Tabs>
  )
}

export const StepGroupTemplateCommandsWithRef = React.forwardRef(StepGroupTemplateCommands)
