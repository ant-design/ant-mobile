import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode, CSSProperties, ReactElement } from 'react'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { mergeProps } from '../../utils/with-default-props'
import classNames from 'classnames'
import { SwiperItem } from './swiper-item'
import { devWarning } from '../../utils/dev-log'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import PageIndicator, { PageIndicatorProps } from '../page-indicator'
import { staged } from 'staged-components'
import { useRefState } from '../../utils/use-ref-state'
import { bound } from '../../utils/bound'
import { useIsomorphicLayoutEffect, useGetState } from 'ahooks'
import { mergeFuncProps } from '../../utils/with-func-props'

const classPrefix = `adm-swiper`

const eventToPropRecord = {
  'mousedown': 'onMouseDown',
  'mousemove': 'onMouseMove',
  'mouseup': 'onMouseUp',
} as const

type ValuesToUnion<T, K extends keyof T = keyof T> = K extends keyof T
  ? T[K]
  : never

type PropagationEvent = keyof typeof eventToPropRecord

export type SwiperRef = {
  swipeTo: (index: number, immediate?: boolean) => void
  swipeNext: () => void
  swipePrev: () => void
}

export type SwiperProps = {
  defaultIndex?: number
  allowTouchMove?: boolean
  autoplay?: boolean | 'reverse'
  autoplayInterval?: number
  loop?: boolean
  direction?: 'horizontal' | 'vertical'
  onIndexChange?: (index: number) => void
  indicatorProps?: Pick<PageIndicatorProps, 'color' | 'style' | 'className'>
  indicator?: false | ((total: number, current: number) => ReactNode)
  slideSize?: number
  trackOffset?: number
  stuckAtBoundary?: boolean
  rubberband?: boolean
  stopPropagation?: PropagationEvent[]
  /**
   * Virtual scroll usage. Should work with renderProps `children`
   */
  total?: number
  /**
   * renderProps is only work when `total` used
   */
  children?: ReactElement | ReactElement[] | ((index: number) => ReactElement)
} & NativeProps<'--height' | '--width' | '--border-radius' | '--track-padding'>

const defaultProps = {
  defaultIndex: 0,
  allowTouchMove: true,
  autoplay: false as SwiperProps['autoplay'],
  autoplayInterval: 3000,
  loop: false,
  direction: 'horizontal',
  slideSize: 100,
  trackOffset: 0,
  stuckAtBoundary: true,
  rubberband: true,
  stopPropagation: [] as PropagationEvent[],
}

let currentUid: undefined | {}

export const Swiper = forwardRef<SwiperRef, SwiperProps>(
  staged<SwiperProps, SwiperRef>((p, ref) => {
    const props = mergeProps(defaultProps, p)

    const { direction, total, children, indicator } = props

    const [uid] = useState({})
    const timeoutRef = useRef<number | null>(null)
    const isVertical = direction === 'vertical'

    const slideRatio = props.slideSize / 100
    const offsetRatio = props.trackOffset / 100

    const { validChildren, count, renderChildren } = useMemo(() => {
      let count = 0

      let renderChildren: ((index: number) => ReactElement) | undefined =
        undefined
      let validChildren: ReactElement[] | null | undefined = undefined

      if (typeof children === 'function') {
        renderChildren = children
      } else {
        validChildren = React.Children.map(children, child => {
          if (!React.isValidElement(child)) return null
          if (child.type !== SwiperItem) {
            devWarning(
              'Swiper',
              'The children of `Swiper` must be `Swiper.Item` components.'
            )
            return null
          }
          count++
          return child
        })
      }

      return {
        renderChildren,
        validChildren,
        count,
      }
    }, [children])

    const mergedTotal = total ?? count

    if (mergedTotal === 0 || (!validChildren && !renderChildren)) {
      devWarning('Swiper', '`Swiper` needs at least one child.')
      return null
    }

    return () => {
      let loop = props.loop
      if (slideRatio * (mergedTotal - 1) < 1) {
        loop = false
      }
      const trackRef = useRef<HTMLDivElement>(null)

      function getSlidePixels() {
        const track = trackRef.current
        if (!track) return 0
        const trackPixels = isVertical ? track.offsetHeight : track.offsetWidth
        return (trackPixels * props.slideSize) / 100
      }

      const [current, setCurrent, getCurrent] = useGetState(props.defaultIndex)

      const [dragging, setDragging, draggingRef] = useRefState(false)

      function boundIndex(current: number) {
        let min = 0
        let max = mergedTotal - 1
        if (props.stuckAtBoundary) {
          min += offsetRatio / slideRatio
          max -= (1 - slideRatio - offsetRatio) / slideRatio
        }
        return bound(current, min, max)
      }

      const [{ position }, api] = useSpring(
        () => ({
          position: boundIndex(current) * 100,
          config: { tension: 200, friction: 30 },
          onRest: () => {
            if (draggingRef.current) return
            if (!loop) return
            const rawX = position.get()
            const totalWidth = 100 * mergedTotal
            const standardPosition = modulus(rawX, totalWidth)
            if (standardPosition === rawX) return
            api.start({
              position: standardPosition,
              immediate: true,
            })
          },
        }),
        [mergedTotal]
      )

      const dragCancelRef = useRef<(() => void) | null>(null)
      function forceCancelDrag() {
        dragCancelRef.current?.()
        draggingRef.current = false
      }

      const bind = useDrag(
        state => {
          dragCancelRef.current = state.cancel
          if (!state.intentional) return
          if (state.first && !currentUid) {
            currentUid = uid
          }
          if (currentUid !== uid) return
          currentUid = state.last ? undefined : uid
          const slidePixels = getSlidePixels()
          if (!slidePixels) return
          const paramIndex = isVertical ? 1 : 0
          const offset = state.offset[paramIndex]
          const direction = state.direction[paramIndex]
          const velocity = state.velocity[paramIndex]
          setDragging(true)
          if (!state.last) {
            api.start({
              position: (offset * 100) / slidePixels,
              immediate: true,
            })
          } else {
            const minIndex = Math.floor(offset / slidePixels)
            const maxIndex = minIndex + 1
            const index = Math.round(
              (offset + velocity * 2000 * direction) / slidePixels
            )
            swipeTo(bound(index, minIndex, maxIndex))
            window.setTimeout(() => {
              setDragging(false)
            })
          }
        },
        {
          transform: ([x, y]) => [-x, -y],
          from: () => {
            const slidePixels = getSlidePixels()
            return [
              (position.get() / 100) * slidePixels,
              (position.get() / 100) * slidePixels,
            ]
          },
          triggerAllEvents: true,
          bounds: () => {
            if (loop) return {}
            const slidePixels = getSlidePixels()
            const lowerBound = boundIndex(0) * slidePixels
            const upperBound = boundIndex(mergedTotal - 1) * slidePixels
            return isVertical
              ? {
                  top: lowerBound,
                  bottom: upperBound,
                }
              : {
                  left: lowerBound,
                  right: upperBound,
                }
          },
          rubberband: props.rubberband,
          axis: isVertical ? 'y' : 'x',
          preventScroll: !isVertical,
          pointer: {
            touch: true,
          },
        }
      )

      function swipeTo(index: number, immediate = false) {
        const roundedIndex = Math.round(index)
        const targetIndex = loop
          ? modulus(roundedIndex, mergedTotal)
          : bound(roundedIndex, 0, mergedTotal - 1)

        if (targetIndex !== getCurrent()) {
          props.onIndexChange?.(targetIndex)
        }

        setCurrent(targetIndex)

        api.start({
          position: (loop ? roundedIndex : boundIndex(roundedIndex)) * 100,
          immediate,
        })
      }

      function swipeNext() {
        swipeTo(Math.round(position.get() / 100) + 1)
      }

      function swipePrev() {
        swipeTo(Math.round(position.get() / 100) - 1)
      }

      useImperativeHandle(ref, () => ({
        swipeTo,
        swipeNext,
        swipePrev,
      }))

      useIsomorphicLayoutEffect(() => {
        const maxIndex = mergedTotal - 1
        if (current > maxIndex) {
          swipeTo(maxIndex, true)
        }
      })

      const { autoplay, autoplayInterval } = props

      const runTimeSwiper = () => {
        timeoutRef.current = window.setTimeout(() => {
          if (autoplay === 'reverse') {
            swipePrev()
          } else {
            swipeNext()
          }
          runTimeSwiper()
        }, autoplayInterval)
      }
      useEffect(() => {
        if (!autoplay || dragging) return

        runTimeSwiper()

        return () => {
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
        }
      }, [autoplay, autoplayInterval, dragging, mergedTotal])

      // ============================== Render ==============================
      // Render Item
      function renderItem(index: number, child: React.ReactNode) {
        let itemStyle: React.CSSProperties = {}

        if (loop) {
          itemStyle = {
            [isVertical ? 'y' : 'x']: position.to(position => {
              let finalPosition = -position + index * 100
              const totalWidth = mergedTotal * 100
              const flagWidth = totalWidth / 2
              finalPosition =
                modulus(finalPosition + flagWidth, totalWidth) - flagWidth
              return `${finalPosition}%`
            }),
            [isVertical ? 'top' : 'left']: `-${index * 100}%`,
          }
        }

        return (
          <animated.div
            className={classNames(`${classPrefix}-slide`, {
              [`${classPrefix}-slide-active`]: current === index,
            })}
            style={itemStyle}
            key={index}
          >
            {child}
          </animated.div>
        )
      }

      function renderItems() {
        if (renderChildren && total) {
          const offsetCount = 2
          const startIndex = Math.max(current - offsetCount, 0)
          const endIndex = Math.min(current + offsetCount, total - 1)

          const items: ReactElement[] = []
          for (let index = startIndex; index <= endIndex; index += 1) {
            items.push(renderItem(index, renderChildren(index)))
          }

          return (
            <>
              <div
                className={`${classPrefix}-slide-placeholder`}
                style={{
                  width: `${startIndex * 100}%`,
                }}
              />
              {items}
            </>
          )
        }

        return React.Children.map(validChildren, (child, index) => {
          return renderItem(index, child)
        })
      }

      // Render Track Inner
      function renderTrackInner() {
        if (loop) {
          return (
            <div className={`${classPrefix}-track-inner`}>{renderItems()}</div>
          )
        } else {
          return (
            <animated.div
              className={`${classPrefix}-track-inner`}
              style={{
                [isVertical ? 'y' : 'x']: position.to(
                  position => `${-position}%`
                ),
              }}
            >
              {renderItems()}
            </animated.div>
          )
        }
      }

      // Render
      const style: CSSProperties &
        Record<'--slide-size' | '--track-offset', string> = {
        '--slide-size': `${props.slideSize}%`,
        '--track-offset': `${props.trackOffset}%`,
      }

      const dragProps = { ...(props.allowTouchMove ? bind() : {}) }
      const stopPropagationProps: Partial<
        Record<ValuesToUnion<typeof eventToPropRecord>, any>
      > = {}
      for (const key of props.stopPropagation) {
        const prop = eventToPropRecord[key]
        stopPropagationProps[prop] = function (e: Event) {
          e.stopPropagation()
        }
      }

      const mergedProps = mergeFuncProps(dragProps, stopPropagationProps)

      let indicatorNode: ReactNode = null

      if (typeof indicator === 'function') {
        indicatorNode = indicator(mergedTotal, current)
      } else if (indicator !== false) {
        indicatorNode = (
          <div className={`${classPrefix}-indicator`}>
            <PageIndicator
              {...props.indicatorProps}
              total={mergedTotal}
              current={current}
              direction={direction}
            />
          </div>
        )
      }

      return withNativeProps(
        props,
        <div
          className={classNames(classPrefix, `${classPrefix}-${direction}`)}
          style={style}
        >
          <div
            ref={trackRef}
            className={classNames(`${classPrefix}-track`, {
              [`${classPrefix}-track-allow-touch-move`]: props.allowTouchMove,
            })}
            onClickCapture={e => {
              if (draggingRef.current) {
                e.stopPropagation()
              }
              forceCancelDrag()
            }}
            {...mergedProps}
          >
            {renderTrackInner()}
          </div>

          {indicatorNode}
        </div>
      )
    }
  })
)

function modulus(value: number, division: number) {
  const remainder = value % division
  return remainder < 0 ? remainder + division : remainder
}
