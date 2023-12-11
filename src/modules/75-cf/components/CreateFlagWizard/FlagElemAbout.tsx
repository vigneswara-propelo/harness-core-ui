/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormError,
  FormInput,
  Heading,
  Layout,
  Container,
  StepProps,
  Button,
  ButtonVariation,
  Text,
  Utils
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { illegalIdentifiers } from '@common/utils/StringUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Tag } from 'services/cf'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { MAX_TAG_NAME_LENGTH } from '@cf/constants'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import type { FlagWizardFormValues } from './FlagWizard'
import css from './FlagElemAbout.module.scss'

export interface FlagElemAboutProps {
  goBackToTypeSelections: () => void
  tags?: Tag[]
  tagsError?: unknown
}

type AboutFormProps = FormikProps<any> & FlagElemAboutProps & { isEdit: boolean; disabled: boolean }

const AboutForm: FC<AboutFormProps> = props => {
  const { getString } = useStrings()
  const { FFM_8184_FEATURE_FLAG_TAGGING } = useFeatureFlags()

  const { tags = [], disabled, handleSubmit, goBackToTypeSelections, errors } = props

  const tagItems = useMemo(
    () =>
      tags?.map(t => ({
        label: t.name,
        value: t.identifier
      })),
    [tags]
  )

  return (
    <Form>
      <Layout.Vertical spacing="medium" height="100%">
        <Heading color={Color.GREY_700} level={2}>
          {getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
        </Heading>
        <Container width="60%">
          <FormInput.InputWithIdentifier
            inputName="name"
            idName="identifier"
            isIdentifierEditable
            inputGroupProps={{
              placeholder: getString('cf.creationModal.aboutFlag.ffNamePlaceholder'),
              inputGroup: { autoFocus: true }
            }}
          />
          <FormInput.TextArea label={getString('description')} name="description" />
          {FFM_8184_FEATURE_FLAG_TAGGING && (
            <>
              <FormInput.MultiSelect
                className={css.tagDropdown}
                label={getString('tagsLabel')}
                disabled={disabled}
                name="tags"
                multiSelectProps={{
                  allowCreatingNewItems: true,
                  placeholder: getString('tagsLabel')
                }}
                items={tagItems}
              />
              {Array.isArray(errors.tags) && (
                <FormError name="tags" errorMessage={getString('cf.featureFlags.tagging.inputErrorMessage')} />
              )}
            </>
          )}
        </Container>
        <Layout.Horizontal padding={{ top: 'medium' }} spacing="xsmall">
          <FormInput.CheckBox name="permanent" label={getString('cf.creationModal.aboutFlag.permaFlag')} />
          <Text
            tooltip={getString('cf.creationModal.aboutFlag.permaFlagTooltip')}
            tooltipProps={{
              isDark: true,
              portalClassName: css.aboutFlagTooltip
            }}
            inline
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex spacing="small" className={css.footerBtns}>
          <Button
            type="button"
            text={getString('back')}
            variation={ButtonVariation.SECONDARY}
            onMouseDown={e => {
              Utils.stopEvent(e)
              goBackToTypeSelections()
            }}
          />
          <Button
            type="submit"
            intent="primary"
            rightIcon="chevron-right"
            text={getString('next')}
            variation={ButtonVariation.PRIMARY}
            onClick={() => handleSubmit()}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Form>
  )
}

const FlagElemAbout: FC<StepProps<Partial<FlagWizardFormValues>> & FlagElemAboutProps> = ({
  nextStep,
  prevStepData,
  goBackToTypeSelections,
  tags,
  tagsError
}) => {
  const { getString } = useStrings()
  const isEdit = Boolean(prevStepData)

  const { trackEvent } = useTelemetry()

  useEffect(() => {
    if (!isEdit) {
      trackEvent(FeatureActions.AboutTheFlag, {
        category: Category.FEATUREFLAG
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  return (
    <Formik
      initialValues={{
        name: prevStepData?.name || '',
        identifier: prevStepData?.identifier || '',
        description: prevStepData?.description || '',
        tags: prevStepData?.tags || [],
        permanent: prevStepData?.permanent || false
      }}
      formName="cfFlagElem"
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(getString('cf.creationModal.aboutFlag.nameRequired')),
        identifier: Yup.string()
          .trim()
          .required(getString('cf.creationModal.aboutFlag.idRequired'))
          .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('cf.creationModal.aboutFlag.ffRegex'))
          .notOneOf(illegalIdentifiers),
        tags: Yup.array()
          .of(
            Yup.object().shape({
              label: Yup.string()
                .trim()
                .max(MAX_TAG_NAME_LENGTH, getString('cf.featureFlags.tagging.inputErrorMessage'))
                .matches(/^[A-Za-z0-9.@_ -]*$/, getString('cf.featureFlags.tagging.inputErrorMessage'))
            })
          )
          .max(10, getString('cf.featureFlags.tagging.inputErrorMessage'))
      })}
      onSubmit={vals => {
        trackEvent(FeatureActions.AboutTheFlagNext, {
          category: Category.FEATUREFLAG,
          data: vals
        })

        nextStep?.({ ...prevStepData, ...vals })
      }}
    >
      {formikProps => (
        <AboutForm
          disabled={!!tagsError}
          isEdit={isEdit}
          goBackToTypeSelections={goBackToTypeSelections}
          tags={tags}
          {...formikProps}
        />
      )}
    </Formik>
  )
}

export default FlagElemAbout
