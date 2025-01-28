import { CheckOutline } from 'antd-mobile-icons'
import type { FC, ReactNode } from 'react'
import React from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { usePropsValue } from '../../utils/use-props-value'
import { mergeProps } from '../../utils/with-default-props'
import { useConfig } from '../config-provider'
import List, { ListProps } from '../list'
import { CheckListContext } from './context'

const classPrefix = 'adm-check-list'

export type CheckListValue = string | number

export type CheckListProps = Pick<ListProps, 'mode' | 'style'> & {
  defaultValue?: CheckListValue[]
  value?: CheckListValue[]
  onChange?: (val: CheckListValue[]) => void
  multiple?: boolean
  activeIcon?: ReactNode
  extra?: (active: boolean) => ReactNode
  disabled?: boolean
  readOnly?: boolean
  children?: ReactNode
  activeSetPathMiddleware: {
    activeIconSetPath: any
    value?: any
    event?: any
    setPath: any
    index: any
  }
} & NativeProps

const defaultProps = {
  multiple: false,
  defaultValue: [],
  activeIcon: <CheckOutline />,
}

export const CheckList: FC<CheckListProps> = props => {
  const { checkList: componentConfig = {} } = useConfig()
  const mergedProps = mergeProps(defaultProps, componentConfig, props)

  const [value, setValue] = usePropsValue(mergedProps)

  function check(val: CheckListValue) {
    if (mergedProps.multiple) {
      setValue([...(value as CheckListValue[]), val])
    } else {
      setValue([val])
    }
  }

  function uncheck(val: CheckListValue) {
    setValue(value.filter(item => item !== val))
  }

  const { activeIcon, extra, disabled, readOnly, activeSetPathMiddleware } =
    mergedProps

  return (
    <CheckListContext.Provider
      value={{
        value,
        check,
        uncheck,
        activeIcon,
        extra,
        disabled,
        readOnly,
        activeSetPathMiddleware,
      }}
    >
      {withNativeProps(
        mergedProps,
        <List mode={mergedProps.mode} className={classPrefix}>
          {mergedProps.children}
        </List>
      )}
    </CheckListContext.Provider>
  )
}
