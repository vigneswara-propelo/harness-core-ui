/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getLocationPathName = (): string => {
  const nameSpace = window.harnessNameSpace ? `${window.harnessNameSpace}/` : ''
  const pathName = `/${nameSpace}ng/`
  return pathName
}
/** function returning equivalent path when browserRouter is enabled for window.location.href.split('#')[0] */
export const getWindowLocationUrl = (): string => {
  let path = `${window.location.origin}${getLocationPathName()}`
  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1)
  }
  return path
}
