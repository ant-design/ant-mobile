import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  hide,
  limitShift,
  offset,
  shift,
} from '@floating-ui/dom'
import { useClickAway, useIsomorphicLayoutEffect } from 'ahooks'
import classNames from 'classnames'
import type { ReactElement, ReactNode } from 'react'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { convertPx } from '../../utils/convert-px'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import {
  GetContainer,
  renderToContainer,
} from '../../utils/render-to-container'
import { useShouldRender } from '../../utils/should-render'
import { usePropsValue } from '../../utils/use-props-value'
import { mergeProps } from '../../utils/with-default-props'
import {
  PropagationEvent,
  withStopPropagation,
} from '../../utils/with-stop-propagation'
import { Arrow } from './arrow'
import { DeprecatedPlacement, Placement } from './index'
import { normalizePlacement } from './normalize-placement'
import { Wrapper } from './wrapper'

const classPrefix = `adm-popover`

export type PopoverProps = {
  defaultVisible?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  getContainer?: GetContainer
  destroyOnHide?: boolean
  children: ReactElement
  mode?: 'light' | 'dark'
  trigger?: 'click'
  placement?: Placement | DeprecatedPlacement
  stopPropagation?: PropagationEvent[]
  content: ReactNode
} & NativeProps<'--z-index' | '--arrow-size'>

export type PopoverRef = {
  show: () => void
  hide: () => void
  visible: boolean
}

const defaultProps = {
  placement: 'top' as Placement,
  defaultVisible: false,
  stopPropagation: ['click'],
  getContainer: () => document.body,
  mode: 'light',
}

export const Popover = forwardRef<PopoverRef, PopoverProps>((p, ref) => {
  const props = mergeProps(defaultProps, p)
  const placement = normalizePlacement(props.placement)

  const [visible, setVisible] = usePropsValue<boolean>({
    value: props.visible,
    defaultValue: props.defaultVisible,
    onChange: props.onVisibleChange,
  })

  useImperativeHandle(
    ref,
    () => ({
      show: () => {
        stateRef.current.isClickShow = true
        setVisible(true)
      },
      hide: () => setVisible(false),
      visible,
    }),
    [visible]
  )

  const stateRef = useRef({ isClickShow: false })
  const targetRef = useRef<Wrapper>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  const floating = withStopPropagation(
    props.stopPropagation,
    withNativeProps(
      props,
      <div
        className={classNames(classPrefix, `${classPrefix}-${props.mode}`, {
          [`${classPrefix}-hidden`]: !visible,
        })}
        ref={floatingRef}
      >
        <div className={`${classPrefix}-arrow`} ref={arrowRef}>
          <Arrow className={`${classPrefix}-arrow-icon`} />
        </div>
        <div className={`${classPrefix}-inner`}>
          <div className={`${classPrefix}-inner-content`}>{props.content}</div>
        </div>
      </div>
    )
  )

  const [targetElement, setTargetElement] = useState<Element | null>(null)

  async function update() {
    const target = targetRef.current?.element ?? null
    const floating = floatingRef.current
    const arrowElement = arrowRef.current
    setTargetElement(target)
    if (!target || !floating || !arrowElement) return
    const {
      x,
      y,
      placement: realPlacement,
      middlewareData,
    } = await computePosition(target, floating, {
      placement,
      middleware: [
        offset(convertPx(12)),
        shift({
          padding: convertPx(4),
          crossAxis: false,
          limiter: limitShift(),
        }),
        flip(),
        hide(),
        arrow({
          element: arrowElement,
          padding: convertPx(12),
        }),
      ],
    })
    Object.assign(floating.style, {
      left: `${x}px`,
      top: `${y}px`,
    })
    const side = realPlacement.split('-')[0] as string
    const arrowSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[side] as string
    const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {}
    Object.assign(arrowElement.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [arrowSide]: 'calc(var(--arrow-size) * -1)',
    })
    const arrowRotate = {
      top: '0deg',
      bottom: '180deg',
      left: '270deg',
      right: '90deg',
    }[side] as string
    arrowElement.style.setProperty('--arrow-icon-rotate', arrowRotate)
  }

  useIsomorphicLayoutEffect(() => {
    update()
  })

  useEffect(() => {
    if (!targetElement) return
    if (!props.trigger) return

    function handleClick() {
      setVisible(v => !v)
    }
    targetElement.addEventListener('click', handleClick)
    return () => {
      targetElement.removeEventListener('click', handleClick)
    }
  }, [targetElement, props.trigger])

  useEffect(() => {
    const floatingElement = floatingRef.current
    if (!targetElement || !floatingElement || !visible) return
    return autoUpdate(targetElement, floatingElement, update, {
      elementResize: typeof ResizeObserver !== 'undefined',
    })
  }, [targetElement, visible])

  useClickAway(
    () => {
      if (!props.trigger) return
      if (stateRef.current.isClickShow) {
        stateRef.current.isClickShow = false
        return
      }
      setVisible(false)
    },
    [() => targetRef.current?.element, floatingRef],
    ['click', 'touchmove']
  )

  const shouldRender = useShouldRender(visible, false, props.destroyOnHide)

  return (
    <>
      <Wrapper ref={targetRef}>{props.children}</Wrapper>
      {shouldRender && renderToContainer(props.getContainer, floating)}
    </>
  )
})
