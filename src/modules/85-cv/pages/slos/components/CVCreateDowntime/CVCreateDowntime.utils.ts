/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type { UseStringsReturn } from 'framework/strings'
import type { DowntimeDTO } from 'services/cv'
import { DowntimeForm, DowntimeFormFields } from './CVCreateDowntime.types'

export const getDowntimeInitialFormData = (sloDowntime?: DowntimeDTO): DowntimeForm => {
  return {
    [DowntimeFormFields.NAME]: sloDowntime?.name || '',
    [DowntimeFormFields.IDENTIFIER]: sloDowntime?.identifier || '',
    [DowntimeFormFields.TAGS]: sloDowntime?.tags,
    [DowntimeFormFields.DESCRIPTION]: sloDowntime?.description,
    [DowntimeFormFields.CATEGORY]: sloDowntime?.category || ('' as DowntimeDTO['category'])
  }
}

export const handleDowntimeSubmit = (values: any) => values

export const getDowntimeFormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  return Yup.object().shape({
    [DowntimeFormFields.NAME]: Yup.string()
      .trim()
      .required(getString('cv.sloDowntime.validations.nameValidation'))
      .matches(/^[0-9a-zA-Z-_\s]+$/, getString('cv.slos.validations.specialCharacters')),
    [DowntimeFormFields.IDENTIFIER]: Yup.string().when([DowntimeFormFields.NAME], {
      is: name => name,
      then: Yup.string().trim().required(getString('validation.identifierRequired'))
    })
  })
}

export const getDowntimeCategoryOptions = (getString: UseStringsReturn['getString']): Item[] => {
  return [
    {
      label: getString('cv.sloDowntime.scheduledMaintenance'),
      value: 'ScheduledMaintenance'
    },
    {
      label: getString('deploymentText'),
      value: 'Deployment'
    },
    {
      label: getString('common.other'),
      value: 'Other'
    }
  ]
}
