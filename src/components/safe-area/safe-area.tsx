import React from 'react'
import type { FC } from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'

import classNames from 'classnames'

const classPrefix = 'adm-safe-area'

export type SafeAreaProps = {
  position: 'top' | 'bottom'
} & NativeProps<'--multiple'>

export const SafeArea: FC<SafeAreaProps> = props => {
  return withNativeProps(
    props,
    <div
      className={classNames(
        classPrefix,
        `${classPrefix}-position-${props.position}`
      )}
    />
  )
}
