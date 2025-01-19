import classNames from 'classnames'
import type { CSSProperties, FC, ReactNode } from 'react'
import React from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'

const classPrefix = `adm-card`

export type CardProps = {
  title?: ReactNode
  icon?: ReactNode
  extra?: ReactNode
  headerStyle?: CSSProperties
  headerClassName?: string
  bodyStyle?: CSSProperties
  bodyClassName?: string
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onBodyClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onHeaderClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  children?: ReactNode
} &
  NativeProps<
    | '--adm-card-border-radius'
    | '--adm-card-padding-inline'
    | '--adm-card-header-border-width'
    | '--adm-card-header-border-color'
    | '--adm-card-header-padding-block'
    | '--adm-card-body-padding-block'
  >

export const Card: FC<CardProps> = props => {
  const renderHeader = () => {
    if (!(props.title || props.extra)) {
      return null
    }
    return (
      <div
        className={classNames(`${classPrefix}-header`, props.headerClassName)}
        style={props.headerStyle}
        onClick={props.onHeaderClick}
      >
        {props.icon && (
          <div className={`${classPrefix}-header-icon`}>{props.icon}</div>
        )}
        <div className={`${classPrefix}-header-title`}>{props.title}</div>
        {props.extra && (
          <div className={`${classPrefix}-header-extra`}>{props.extra}</div>
        )}
      </div>
    )
  }

  const renderBody = () => {
    if (!props.children) {
      return null
    }
    return (
      <div
        className={classNames(`${classPrefix}-body`, props.bodyClassName)}
        style={props.bodyStyle}
        onClick={props.onBodyClick}
      >
        {props.children}
      </div>
    )
  }

  return withNativeProps(
    props,
    <div className={classPrefix} onClick={props.onClick}>
      {renderHeader()}
      {renderBody()}
    </div>
  )
}
