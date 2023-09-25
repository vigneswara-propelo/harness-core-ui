import React from 'react'
import * as Yup from 'yup'
import { Container, Text, Button, ButtonVariation, Layout, FormInput, useToggleOpen, ButtonSize } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Formik } from 'formik'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { AidaActions } from '@common/constants/TrackingConstants'
import { String, useStrings } from 'framework/strings'
import { SubmitTicketModal } from '../ResourceCenter/SubmitTicketModal/SubmitTicketModal'
import { TelemeteryProps } from '../UsefulOrNot/UsefulOrNot'

import css from './AidaFeedback.module.scss'

interface AidaFeedbackProps {
  allowCreateTicket?: boolean
  setShowFeedback: (showFeedback: boolean) => void
  telemetry: TelemeteryProps
}

interface AidaFeedbackFormValues {
  notCorrect?: boolean
  notRelevant?: boolean
  feedback?: string
}

const MAX_LENGTH = 250

export default function AidaFeedback({
  allowCreateTicket,
  setShowFeedback,
  telemetry
}: AidaFeedbackProps): React.ReactElement {
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const [submitted, setSubmitted] = React.useState(false)
  const { isOpen, close: closeSubmitTicketModal, open: openSubmitTicketModal } = useToggleOpen()

  return submitted ? (
    <Text>{getString('common.aidaFeedback.thanks')}</Text>
  ) : (
    <Container background={Color.GREY_100} padding={'medium'} margin={{ top: 'small' }} className={css.aidaFeedback}>
      <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>{getString('common.aidaFeedback.title')}</Text>
      <Button
        variation={ButtonVariation.ICON}
        minimal
        icon="main-close"
        role="close"
        iconProps={{ size: 12 }}
        size={ButtonSize.SMALL}
        className={css.closeButton}
        onClick={() => {
          setShowFeedback(false)
        }}
      />
      <Formik<AidaFeedbackFormValues>
        initialValues={{
          notCorrect: false,
          notRelevant: false,
          feedback: ''
        }}
        onSubmit={values => {
          trackEvent(AidaActions.FeedbackReceived, {
            notCorrect: !!values.notCorrect,
            notRelevant: !!values.notRelevant,
            feedback: values.feedback || '',
            ...telemetry
          })
          setSubmitted(true)
        }}
        validationSchema={Yup.object().shape({
          feedback: Yup.string()
            .max(MAX_LENGTH, getString('common.aidaFeedback.maxLengthError', { maxLength: MAX_LENGTH }))
            .when(['notCorrect', 'notRelevant'], {
              is: (notCorrect, notRelevant) => !notCorrect && !notRelevant,
              then: Yup.string().required(getString('common.aidaFeedback.required'))
            })
        })}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Layout.Vertical margin={{ top: 'small' }}>
              <FormInput.CheckBox label={getString('common.aidaFeedback.notCorrect')} name="notCorrect" />
              <FormInput.CheckBox label={getString('common.aidaFeedback.notRelevant')} name="notRelevant" />
              <FormInput.TextArea
                name="feedback"
                maxLength={MAX_LENGTH}
                placeholder={getString('common.aidaFeedback.placeholder')}
              />
              <Container margin={{ bottom: 'small' }}>
                <Button type="submit" text="Submit" variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} />
              </Container>
              {allowCreateTicket ? (
                <>
                  <SubmitTicketModal isOpen={isOpen} close={closeSubmitTicketModal} />
                  <Text font={{ variation: FontVariation.TINY }}>
                    <String stringID="common.csBot.ticketOnError" />
                    &nbsp;
                    <a href="#" onClick={openSubmitTicketModal}>
                      <String stringID="common.clickHere" />
                    </a>
                  </Text>
                </>
              ) : null}
            </Layout.Vertical>
          </form>
        )}
      </Formik>
    </Container>
  )
}
