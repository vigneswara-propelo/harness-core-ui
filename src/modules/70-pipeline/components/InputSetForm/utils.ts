/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, forOwn, omitBy, pick } from 'lodash-es'
import { SaveToGitFormInterface } from '@modules/10-common/components/SaveToGitForm/SaveToGitForm'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { InputSetKVPairs, InputSetMetadata } from './types'

const OMIT_FIELDS = ['identifier', 'name', 'tags', 'description']

export const replaceEmptyWithNull = (values: InputSetKVPairs): { changed: boolean; values: InputSetKVPairs } => {
  let changed = false
  const retValues: InputSetKVPairs = {}
  forOwn(values, (value: unknown, key: unknown) => {
    if (typeof key === 'string') {
      if (value === '' || value === null) {
        changed = true
        retValues[key as string] = null
      } else {
        retValues[key as string] = value
      }
    }
  })

  return { changed, values: retValues }
}

export const getInputSetFromYaml = (
  values: InputSetKVPairs,
  options: { escapeEmpty: boolean } = { escapeEmpty: false }
): InputSetKVPairs => {
  const ret = cloneDeep(values)

  if (options.escapeEmpty) {
    forOwn(ret, (value: unknown, key: unknown) => {
      if (typeof key === 'string' && typeof value === 'string') {
        ret[key as string] = value === '' ? '""' : value
      }
    })
  }

  return ret
}

export const getInputSetFromFormikValues = (
  values: InputSetKVPairs,
  options: { escapeEmpty: boolean } = { escapeEmpty: false }
): InputSetKVPairs => {
  const ret = omitBy(values, (_val, key) => OMIT_FIELDS.includes(key) || key.startsWith('_'))

  if (options.escapeEmpty) {
    forOwn(ret, (value: unknown, key: unknown) => {
      if (typeof key === 'string' && typeof value === 'string') {
        ret[key as string] = value === '""' ? '' : value
      }
    })
  }

  return ret
}

export const getInputSetMetadataFromFormikValues = (values: InputSetKVPairs & InputSetMetadata): InputSetMetadata => {
  return pick(values, 'name', 'identifier')
}

export const addRemoveKeysFromInputSet = (inputSet: InputSetKVPairs, visibleKeys: string[]): InputSetKVPairs => {
  const newInputSet = cloneDeep(inputSet)

  // add
  visibleKeys.forEach(key => {
    if (typeof newInputSet[key] === 'undefined') newInputSet[key] = null
  })

  // remove
  Object.keys(newInputSet).forEach(key => {
    if (!visibleKeys.includes(key)) {
      delete newInputSet[key]
    }
  })

  return newInputSet
}

export interface GetUpdatedGitDetailsReturnType extends EntityGitDetails {
  lastObjectId?: string
  lastCommitId?: string
  baseBranch?: string
}

export const getUpdatedGitDetails = (
  isEdit: boolean,
  gitDetails: SaveToGitFormInterface | undefined,
  lastObjectId: string,
  initialGitDetails: EntityGitDetails,
  conflictCommitId?: string
): GetUpdatedGitDetailsReturnType => {
  let updatedGitDetails: GetUpdatedGitDetailsReturnType = {}
  if (gitDetails) {
    updatedGitDetails = { ...gitDetails }
    if (isEdit) {
      updatedGitDetails['lastObjectId'] = lastObjectId
      updatedGitDetails['lastCommitId'] = conflictCommitId || initialGitDetails.commitId
    }
    if (gitDetails.isNewBranch) {
      updatedGitDetails['baseBranch'] = initialGitDetails.branch
    }
  }
  return updatedGitDetails
}
