/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { isEmpty } from 'lodash-es'
import type { DiagnosticsOptions } from 'monaco-yaml'
import { validate } from 'jsonschema'

const DEFAULT_YAML_PATH = 'DEFAULT_YAML_PATH'

/**
 * @description Find json path(s) of a given node in json from it's nearest parent
 * @param jsonObj json equivalent of yaml
 * @param leafNode leaf node whose path(s) from the nearest parent needs to be known
 * @param delimiter delimiter to be used in node path(s) from parent
 * @returns exactly matching json path in the tree
 */
const findLeafToParentPath = (jsonObj: Record<string, any>, leafNode: string, delimiter = '.'): string | undefined => {
  // to remove all leading non-characters
  const leaf = leafNode.replace(/^[^a-zA-Z]+/, '')
  const matchingPath: string[] = []
  function findPath(currJSONObj: Record<string, any>, currentDepth: number, previous?: string): void {
    Object.keys(currJSONObj).forEach((key: string) => {
      const value = currJSONObj[key]
      const type = Object.prototype.toString.call(value)
      const isObject = type === '[object Object]' || type === '[object Array]'
      const newKey = previous ? previous + delimiter + key : key
      if (isObject && Object.keys(value).length) {
        if (key.match(leaf)) {
          matchingPath.push(newKey)
        }
        return findPath(value, currentDepth + 1, newKey)
      }
      if (newKey.match(leaf)) {
        matchingPath.push(newKey)
      }
    })
  }
  findPath(jsonObj, 1)
  return matchingPath.length > 0 ? matchingPath.slice(-1).pop() : 'DEFAULT_YAML_PATH'
}

/**
 * @description Validate a JSON against a schema
 *
 * @param jsonObj json to be validated
 * @param schema schema against which json is to be validated
 * @returns Map of json path to list of errors at that path
 */
async function validateJSONWithSchema(
  jsonObj: Record<string, any>,
  schema: Record<string, any>
): Promise<Map<string, string[]>> {
  const errorMap = new Map<string, string[]>()

  if (isEmpty(jsonObj) || isEmpty(schema)) {
    return errorMap
  }

  try {
    const result = validate(jsonObj, schema, {
      nestedErrors: true,
      allowUnknownAttributes: true,
      required: false
    })

    if (result.valid) return errorMap

    return result.errors.reduce((acc, error) => {
      const path = error.path.join('.')
      const value = acc.get(path) ?? []
      value.push(error.message)
      return acc.set(path, value)
    }, errorMap)
  } catch (_) {
    return errorMap
  }
}

const getDiagnosticsOptions = (schema?: Record<string, any>): DiagnosticsOptions => {
  return {
    validate: true,
    enableSchemaRequest: false,
    hover: true,
    completion: true,
    ...(schema && {
      schemas: [
        {
          fileMatch: ['*'],
          schema,
          // uri should ideally be the source of the schema, but most of the consumers of YamlBuilder don't have URIs for their schemas.
          // Hence a generic URI is used for now.
          uri: 'https://github.com/harness/harness-schema'
        }
      ]
    })
  }
}

export { validateJSONWithSchema, getDiagnosticsOptions, DEFAULT_YAML_PATH, findLeafToParentPath }
