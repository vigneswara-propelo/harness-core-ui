import type { FormikErrors } from 'formik'
import { set } from 'lodash-es'
import moment from 'moment'
import type { UseStringsReturn } from 'framework/strings'
import type { AnnotationMessage } from '@cv/components/ChangeTimeline/components/TimelineRow/components/Annotation/Annotation.types'
import type { AnnotationDTORequestBody } from 'services/cv'
import { AnnotationDetailsFields, DATE_PARSE_FORMAT } from './AnnotationDetails.constants'
import type { AnnotationDetailsForm } from './AnnotationDetails.types'

export function validateAnnotationDetailsForm(
  data: AnnotationDetailsForm,
  getString: UseStringsReturn['getString']
): FormikErrors<AnnotationDetailsForm> {
  const errors: FormikErrors<AnnotationDetailsForm> = {}
  const { annotationMessage = '', startDateTime, endDateTime } = data

  if (!annotationMessage) {
    set(errors, AnnotationDetailsFields.ANNOTATION_MESSAGE, getString('fieldRequired', { field: 'Annotation' }))
  }

  if (moment(startDateTime) > moment(endDateTime)) {
    set(errors, AnnotationDetailsFields.END_DATE_TIME, 'Start date should be before end date')
  }
  return errors
}

export function getAnnotationDetailsFormInitialValues(annotationMessage?: AnnotationMessage): AnnotationDetailsForm {
  const { message, startTime, endTime } = annotationMessage || {}
  const data = {
    startDateTime: startTime
      ? moment(new Date(startTime)).format(DATE_PARSE_FORMAT)
      : moment().format(DATE_PARSE_FORMAT),
    endDateTime: endTime
      ? moment(new Date(endTime)).format(DATE_PARSE_FORMAT)
      : moment().add(30, 'minutes').format(DATE_PARSE_FORMAT),
    annotationMessage: message ?? ''
  }
  return data
}

export function getAnnotationReqBody({
  endDateTime,
  message,
  orgIdentifier,
  projectIdentifier,
  sloIdentifier,
  startDateTime
}: {
  endDateTime: string
  message: string
  orgIdentifier: string
  projectIdentifier: string
  sloIdentifier: string
  startDateTime: string
}): AnnotationDTORequestBody {
  return {
    endTime: moment(endDateTime, DATE_PARSE_FORMAT).valueOf() / 1000,
    message,
    orgIdentifier,
    projectIdentifier,
    sloIdentifier,
    startTime: moment(startDateTime, DATE_PARSE_FORMAT).valueOf() / 1000
  }
}
