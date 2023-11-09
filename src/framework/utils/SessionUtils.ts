/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import SecureStorage from './SecureStorage'
import { getLocationPathName } from './WindowLocation'

// Enum for ErrorCode that are handled by ng-auth-ui
export enum ErrorCode {
  GATEWAY_SSO_REDIRECT_ERROR = 'GATEWAY_SSO_REDIRECT_ERROR',
  unauth = 'unauth',
  invalidsso = 'invalidsso',
  email_verify_fail = 'email_verify_fail',
  INVITE_EXPIRED = 'INVITE_EXPIRED',
  INVITE_INVALID = 'INVITE_INVALID',
  DOMAIN_WHITELIST_FAILED = 'DOMAIN_WHITELIST_FAILED'
}

interface GetLoginPageURL {
  returnUrl?: string
  errorCode?: ErrorCode
}

export const getLoginPageURL = ({ returnUrl, errorCode }: GetLoginPageURL): string => {
  const locationPath = getLocationPathName().replace(/\/ng\/?/, '/')
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI ? `${locationPath}auth/#/signin` : `${locationPath}#/login`
  let finalUrl = `${basePath}?action=signout`
  if (returnUrl) {
    finalUrl += `&returnUrl=${encodeURIComponent(returnUrl)}`
  }
  if (errorCode) {
    finalUrl += `&errorCode=${errorCode}`
  }
  return finalUrl
}

export const getForgotPasswordURL = (): string => {
  // for basepath, pick current path, but remove `/ng/` or `/ng`, to respect PR env namespaces
  return window.HARNESS_ENABLE_NG_AUTH_UI
    ? `${getLocationPathName().replace(/\/ng\/?/, '/')}auth/#/forgot-password`
    : `${getLocationPathName().replace(/\/ng\/?/, '/')}#/forgot-password`
}

export interface UseLogoutReturn {
  forceLogout: (errorCode?: ErrorCode) => void
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory()
  let isTriggered = false

  const forceLogout = (errorCode?: ErrorCode): void => {
    if (!isTriggered) {
      isTriggered = true
      SecureStorage.clear()
      history.push({
        pathname: routes.toRedirect(),
        search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href, errorCode }))
      })
    }
  }

  return { forceLogout }
}
// source https://medium.com/@ddevinda/decode-jwt-token-6c75fa9aba6f
export const parseJwtToken = (token: string) => {
  let returnPayload = undefined
  const base64UrlArray = token.split('.')
  if (base64UrlArray.length > 2) {
    const base64Url = base64UrlArray[1]
    try {
      returnPayload = JSON.parse(window.atob(base64Url))
    } catch (_err) {
      returnPayload = undefined
    }
  }
  return returnPayload
}
