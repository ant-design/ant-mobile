import classNames from 'classnames'
import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  MouseEventHandler,
  ReactNode,
} from 'react'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { isPromise } from '../../utils/validate'
import { mergeProps } from '../../utils/with-default-props'
import DotLoading from '../dot-loading'

const classPrefix = `adm-button`

type NativeButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export type ButtonProps = {
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'link'
  fill?: 'solid' | 'outline' | 'none'
  size?: 'mini' | 'small' | 'middle' | 'large'
  block?: boolean
  loading?: boolean | 'auto'
  loadingText?: string
  loadingIcon?: ReactNode
  disabled?: boolean
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void | Promise<void>
  type?: 'submit' | 'reset' | 'button'
  shape?: 'default' | 'rounded' | 'rectangular'
  children?: ReactNode
} & Pick<
  NativeButtonProps,
  'onMouseDown' | 'onMouseUp' | 'onTouchStart' | 'onTouchEnd' | 'id'
> &
  NativeProps<
    | '--text-color'
    | '--background-color'
    | '--border-radius'
    | '--border-width'
    | '--border-style'
    | '--border-color'
  >

export type ButtonRef = {
  nativeElement: HTMLButtonElement | null
}

const defaultProps: ButtonProps = {
  color: 'default',
  fill: 'solid',
  block: false,
  loading: false,
  loadingIcon: <DotLoading color='currentColor' />,
  type: 'button',
  shape: 'default',
  size: 'middle',
}

export const Button = forwardRef<ButtonRef, ButtonProps>((p, ref) => {
  const props = mergeProps(defaultProps, p)
  const [innerLoading, setInnerLoading] = useState(false)
  const nativeButtonRef = useRef<HTMLButtonElement>(null)
  const loading = props.loading === 'auto' ? innerLoading : props.loading
  const disabled = props.disabled || loading

  useImperativeHandle(ref, () => ({
    get nativeElement() {
      return nativeButtonRef.current
    },
  }))

  const handleClick: MouseEventHandler<HTMLButtonElement> = async e => {
    if (!props.onClick) return

    const promise = props.onClick(e)

    if (isPromise(promise)) {
      try {
        setInnerLoading(true)
        await promise
        setInnerLoading(false)
      } catch (e) {
        setInnerLoading(false)
        throw e
      }
    }
  }

  return withNativeProps(
    props,
    <button
      ref={nativeButtonRef}
      type={props.type}
      onClick={handleClick}
      className={classNames(
        classPrefix,
        {
          [`${classPrefix}-${props.color}`]: props.color,
          [`${classPrefix}-block`]: props.block,
          [`${classPrefix}-disabled`]: disabled,
          [`${classPrefix}-fill-outline`]: props.fill === 'outline',
          [`${classPrefix}-fill-none`]: props.fill === 'none',
          [`${classPrefix}-mini`]: props.size === 'mini',
          [`${classPrefix}-small`]: props.size === 'small',
          [`${classPrefix}-large`]: props.size === 'large',
          [`${classPrefix}-loading`]: loading,
        },
        `${classPrefix}-shape-${props.shape}`
      )}
      disabled={disabled}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onTouchStart={props.onTouchStart}
      onTouchEnd={props.onTouchEnd}
    >
      {loading ? (
        <div className={`${classPrefix}-loading-wrapper`}>
          {props.loadingIcon}
          {props.loadingText}
        </div>
      ) : (
        <span>{props.children}</span>
      )}
    </button>
  )
})
