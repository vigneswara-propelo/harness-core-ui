/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Formik, Button, ButtonVariation, StepProps, FormInput } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React, { useState } from 'react'
import { Form } from 'formik'
import { useStrings } from 'framework/strings'
import { useHarnessSupportBot } from 'services/notifications'
import { useTelemetry } from '@modules/10-common/hooks/useTelemetry'
import { SupportTicketActions } from '@modules/10-common/constants/TrackingConstants'
import { AidaResponsePanel } from './SuggestionsPanel'
import css from './SubmitTicketModalSteps.module.scss'

interface AIDASupportStepProps {
  name: string
  stepName: string
}

interface AIDASupportStepFormValues {
  subject: string
  prevStep: string
}

export const AIDASupportStep = (props: StepProps<AIDASupportStepFormValues> & AIDASupportStepProps): JSX.Element => {
  const { stepName, nextStep } = props
  const { getString } = useStrings()
  const { mutate: askQuestion, loading } = useHarnessSupportBot({})
  const [response, setResponse] = useState<string | undefined>(undefined)
  const { trackEvent } = useTelemetry()

  const handleSubmit = async (subject: string): Promise<void> => {
    const userMessage = subject.trim()
    const answer = await askQuestion({ question: userMessage })
    const aidaResponse = answer.data?.response
    if (aidaResponse) {
      trackEvent(SupportTicketActions.AIDASupportAnswerReceived, {
        subject,
        answer: aidaResponse
      })
    }
    setResponse(aidaResponse)
  }

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{
          subject: ''
        }}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          subject: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.ticketDetails')
            })
          )
        })}
        onSubmit={values => {
          nextStep?.({ ...values, prevStep: 'AIDA' })
        }}
      >
        {formik => (
          <Form>
            <Layout.Vertical>
              <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <FormInput.Text
                  name="subject"
                  label={getString('common.resourceCenter.ticketmenu.ticketSubjectDescription')}
                  className={css.aidaInputWidth}
                />
                <Button
                  variation={ButtonVariation.SECONDARY}
                  type="submit"
                  icon={'harness-copilot'}
                  className={css.aidaBtn}
                  disabled={!formik.values.subject}
                  onClick={() => handleSubmit(formik.values.subject)}
                  text={getString('common.resourceCenter.aida.tryAidaSupport')}
                  width={'180'}
                />
              </Layout.Horizontal>
              {(formik.values.subject && response !== undefined) || loading ? (
                <AidaResponsePanel data={response} loading={loading} />
              ) : (
                <div style={{ height: '580px' }} />
              )}
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
                disabled={!formik.values.subject}
                rightIcon="chevron-right"
                className={css.saveBtn}
              />
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
