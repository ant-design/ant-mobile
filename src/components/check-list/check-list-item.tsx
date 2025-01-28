// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useContext } from 'react'
import type { FC } from 'react'
import List, { ListItemProps } from '../list'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { CheckListContext } from './context'
import { devWarning } from '../../utils/dev-log'
import classNames from 'classnames'
import { CheckListValue } from '.'

const classPrefix = `adm-check-list-item`

export type CheckListItemProps = Pick<
  ListItemProps,
  | 'title'
  | 'children'
  | 'description'
  | 'prefix'
  | 'disabled'
  | 'onClick'
  | 'style'
> & {
  value: CheckListValue
  readOnly?: boolean
} & NativeProps

export const CheckListItem: FC<CheckListItemProps> = props => {
  const context = useContext(CheckListContext)
  if (context === null) {
    devWarning(
      'CheckList.Item',
      'CheckList.Item can only be used inside CheckList.'
    )
    return null
  }
  const active = context.value.includes(props.value)
  const readOnly = props.readOnly || context.readOnly
  const defaultExtra = active ? context.activeIcon : null

  const { activeIconSetPath, index, setPath } = active
    ? context.activeSetPathMiddleware
      ? context.activeSetPathMiddleware
      : {}
    : {}
  const renderExtra = context.extra ? context.extra(active) : defaultExtra
  const extra = (
    <div
      className={`${classPrefix}-extra`}
      onClick={event => {
        if (activeIconSetPath) {
          setPath(props.value, index)
          event.stopPropagation()
        }
      }}
    >
      {renderExtra}
    </div>
  )

  return withNativeProps(
    props,
    <List.Item
      title={props.title}
      className={classNames(
        classPrefix,
        readOnly && `${classPrefix}-readonly`,
        active && `${classPrefix}-active`
      )}
      description={props.description}
      prefix={props.prefix}
      onClick={e => {
        if (readOnly) return
        if (active) {
          context.uncheck(props.value)
        } else {
          context.check(props.value)
        }
        props.onClick?.(e)
      }}
      arrow={false}
      clickable={!readOnly}
      extra={extra}
      disabled={props.disabled || context.disabled}
    >
      {props.children}
    </List.Item>
  )
}
