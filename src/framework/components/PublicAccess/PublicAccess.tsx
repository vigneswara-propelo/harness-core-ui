/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useIsPublicAccess, useIsPrivateAccess } from 'framework/hooks/usePublicAccess'

interface PublicAccessProps {
  children: React.ReactNode
}

interface AccessTypeProps {
  public: React.ReactNode
  private: React.ReactNode
}

export const IfPublicAccess: React.FC<PublicAccessProps> = ({ children }) => {
  const isPublicAccess = useIsPublicAccess()
  if (isPublicAccess) {
    return <>{children}</>
  }
  return null
}

export const IfPrivateAccess: React.FC<PublicAccessProps> = ({ children }) => {
  const isPrivateAccess = useIsPrivateAccess()
  if (isPrivateAccess) {
    return <>{children}</>
  }
  return null
}

export const AccessTypeRenderer: React.FC<AccessTypeProps> = ({ public: publicContent, private: privateContent }) => {
  const isPublicAccess = useIsPublicAccess()

  return isPublicAccess ? <>{publicContent}</> : <>{privateContent}</>
}

export const ifPublicAccessHOC = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  const IfPublicAccessInternal: React.FC<P> = props => {
    const isPublicAccess = useIsPublicAccess()

    if (isPublicAccess) {
      return <WrappedComponent {...props} />
    }

    return null
  }

  return IfPublicAccessInternal
}

export const ifPrivateAccessHOC = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  const IfPrivateAccessInternal: React.FC<P> = props => {
    const isPrivateAccess = useIsPrivateAccess()

    if (isPrivateAccess) {
      return <WrappedComponent {...props} />
    }

    return null
  }

  return IfPrivateAccessInternal
}
