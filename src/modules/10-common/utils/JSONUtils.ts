/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { YamlSanityConfig } from '@common/interfaces/YAMLBuilderProps'

/**
 * @description Give a json, removes the following at all nested levels:
empty strings
empty objects(with no keys)
empty arrays
 * @param obj 
 */

export const DEFAULT_SANITY_CONFIG = {
  removeEmptyString: true,
  removeEmptyArray: true,
  removeEmptyObject: true,
  removeNull: true
}

const sanitize = (obj: Record<string, any>, sanityConfig?: YamlSanityConfig): Record<string, any> => {
  const { removeEmptyString, removeEmptyArray, removeEmptyObject, removeNull } = {
    ...DEFAULT_SANITY_CONFIG,
    ...sanityConfig
  }
  for (const key in obj) {
    if (obj[key] === null && removeNull) {
      delete obj[key]
    } else if (obj[key] === undefined) {
      delete obj[key]
    } else if (removeEmptyString && obj[key] === '') {
      delete obj[key]
    } else if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
      if (removeEmptyObject && Object.keys(obj[key]).length === 0) {
        delete obj[key]
      } else {
        sanitize(obj[key], sanityConfig)
      }
    } else if (Array.isArray(obj[key])) {
      if (removeEmptyArray && obj[key].length === 0) {
        delete obj[key]
      } else {
        sanitize(obj[key], sanityConfig)
      }
    }
  }
  return obj
}

/**
 * @description Downloads JSON response as a file
 *
 * @param jsonData JSON object
 * @param fileName Name of the file to be downlaoded
 * @returns Promise resolving to an object with status as boolean
 */
const downloadJSONAsFile = async (jsonData: any, fileName: string): Promise<{ status: boolean }> => {
  try {
    const blob = JSON.stringify(jsonData)
    const file = new Blob([blob], { type: 'application/json;charset=utf-8' })
    const data = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.style.display = 'none'
    anchor.href = data
    anchor.download = fileName
    anchor.click()
    // For Firefox
    setTimeout(() => {
      anchor.remove()
      // Release resource on disk after triggering the download
      window.URL.revokeObjectURL(data)
    }, 100)
    return { status: true }
  } catch (e) {
    return { status: false }
  }
}
export { sanitize, downloadJSONAsFile }
