import { DownFill } from 'antd-mobile-icons'
import classNames from 'classnames'
import type { FC, ReactNode } from 'react'
import React from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { useShouldRender } from '../../utils/should-render'
import { mergeProp, mergeProps } from '../../utils/with-default-props'
import { useConfig } from '../config-provider'
import { IconContext } from './context'

const classPrefix = `adm-dropdown-item`

export type DropdownItemProps = {
  key: string
  title: ReactNode
  active?: boolean
  highlight?: boolean
  forceRender?: boolean
  destroyOnClose?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  arrowIcon?: ReactNode
  /**
   * @deprecated use `arrowIcon` instead
   */
  arrow?: ReactNode
  children?: ReactNode
} & NativeProps

const Item: FC<DropdownItemProps> = props => {
  const { dropdown: componentConfig = {} } = useConfig()
  const mergedProps = mergeProps(componentConfig, props)
  const { active, highlight, onClick, title } = mergedProps
  const cls = classNames(classPrefix, {
    [`${classPrefix}-active`]: active,
    [`${classPrefix}-highlight`]: highlight ?? active,
  })

  const contextArrowIcon = React.useContext(IconContext)
  const mergedArrowIcon = mergeProp(
    <DownFill />,
    contextArrowIcon,
    mergedProps.arrow,
    mergedProps.arrowIcon
  )

  return withNativeProps(
    props,
    <div className={cls} onClick={onClick}>
      <div className={`${classPrefix}-title`}>
        <span className={`${classPrefix}-title-text`}>{title}</span>
        <span
          className={classNames(`${classPrefix}-title-arrow`, {
            [`${classPrefix}-title-arrow-active`]: active,
          })}
        >
          {mergedArrowIcon}
        </span>
      </div>
    </div>
  )
}

export default Item

type DropdownItemChildrenWrapProps = {
  onClick?: () => void
} & Pick<
  DropdownItemProps,
  'active' | 'forceRender' | 'destroyOnClose' | 'children'
>
export const ItemChildrenWrap: FC<DropdownItemChildrenWrapProps> = props => {
  const { active = false } = props
  const shouldRender = useShouldRender(
    active,
    props.forceRender,
    props.destroyOnClose
  )
  const cls = classNames(`${classPrefix}-content`)

  return shouldRender ? (
    <div className={cls} onClick={props.onClick}>
      {props.children}
    </div>
  ) : null
}
