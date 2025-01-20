import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import type { ForwardRefRenderFunction, ReactNode } from 'react'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { convertPx } from '../../utils/convert-px'
import { getScrollParent } from '../../utils/get-scroll-parent'
import { rubberbandIfOutOfBounds } from '../../utils/rubberband'
import { sleep } from '../../utils/sleep'
import { supportsPassive } from '../../utils/supports-passive'
import { mergeProps } from '../../utils/with-default-props'
import { useConfig } from '../config-provider'

const classPrefix = `adm-pull-to-refresh`

export type PullStatus = 'pulling' | 'canRelease' | 'refreshing' | 'complete'

export type PullToRefreshProps = {
  onRefresh?: () => Promise<any>
  pullingText?: ReactNode
  canReleaseText?: ReactNode
  refreshingText?: ReactNode
  completeText?: ReactNode
  completeDelay?: number
  headHeight?: number
  threshold?: number
  disabled?: boolean
  renderText?: (status: PullStatus) => ReactNode
  children?: ReactNode
}

export type PullToRefreshRef = {
  refresh: () => void
}

export const defaultProps = {
  pullingText: '下拉刷新',
  canReleaseText: '释放立即刷新',
  refreshingText: '加载中...',
  completeText: '刷新成功',
  completeDelay: 500,
  disabled: false,
  onRefresh: () => {},
}

export const PullToRefresh$: ForwardRefRenderFunction<
  PullToRefreshRef,
  PullToRefreshProps
> = (p, ref) => {
  const { locale } = useConfig()
  const props = mergeProps(
    defaultProps,
    {
      refreshingText: `${locale.common.loading}...`,
      pullingText: locale.PullToRefresh.pulling,
      canReleaseText: locale.PullToRefresh.canRelease,
      completeText: locale.PullToRefresh.complete,
    },
    p
  )
  const headHeight = props.headHeight ?? convertPx(40)
  const threshold = props.threshold ?? convertPx(60)

  const [status, setStatus] = useState<PullStatus>('pulling')

  const [springStyles, api] = useSpring(() => ({
    from: { height: 0 },
    config: {
      tension: 300,
      friction: 30,
      round: true,
      clamp: true,
    },
  }))

  const elementRef = useRef<HTMLDivElement>(null)

  const pullingRef = useRef(false)

  //防止下拉时抖动
  useEffect(() => {
    elementRef.current?.addEventListener('touchmove', () => {})
  }, [])

  const reset = () => {
    return new Promise<void>(resolve => {
      api.start({
        to: {
          height: 0,
        },
        onResolve() {
          setStatus('pulling')
          resolve()
        },
      })
    })
  }

  async function doRefresh() {
    api.start({ height: headHeight })
    setStatus('refreshing')
    try {
      await props.onRefresh()
      setStatus('complete')
    } catch (e) {
      reset()
      throw e
    }
    if (props.completeDelay > 0) {
      await sleep(props.completeDelay)
    }
    reset()
  }

  useImperativeHandle(ref, () => {
    return {
      refresh: () => {
        if (status === 'refreshing' || status === 'complete') return
        doRefresh()
      },
    }
  })

  useDrag(
    state => {
      if (status === 'refreshing' || status === 'complete') return

      const { event } = state

      if (state.last) {
        pullingRef.current = false
        if (status === 'canRelease') {
          doRefresh()
        } else {
          api.start({ height: 0 })
        }
        return
      }

      const [, y] = state.movement
      const parsedY = Math.ceil(y)

      if (state.first && parsedY > 0) {
        const target = state.event.target
        if (!target || !(target instanceof Element)) return
        let scrollParent = getScrollParent(target)
        while (true) {
          if (!scrollParent) return
          const scrollTop = getScrollTop(scrollParent)
          if (scrollTop > 0) {
            return
          }
          if (scrollParent instanceof Window) {
            break
          }
          scrollParent = getScrollParent(scrollParent.parentNode as Element)
        }
        pullingRef.current = true
        function getScrollTop(element: Window | Element) {
          return 'scrollTop' in element ? element.scrollTop : element.scrollY
        }
      }

      if (!pullingRef.current) return

      if (event.cancelable) {
        event.preventDefault()
      }
      event.stopPropagation()
      const height = Math.max(
        rubberbandIfOutOfBounds(parsedY, 0, 0, headHeight * 5, 0.5),
        0
      )
      api.start({ height })
      setStatus(height > threshold ? 'canRelease' : 'pulling')
    },
    {
      pointer: { touch: true },
      axis: 'y',
      target: elementRef,
      enabled: !props.disabled,
      eventOptions: supportsPassive ? { passive: false } : undefined,
    }
  )

  const renderStatusText = () => {
    if (props.renderText) {
      return props.renderText?.(status)
    }

    if (status === 'pulling') return props.pullingText
    if (status === 'canRelease') return props.canReleaseText
    if (status === 'refreshing') return props.refreshingText
    if (status === 'complete') return props.completeText
  }

  return (
    <animated.div ref={elementRef} className={classPrefix}>
      <animated.div style={springStyles} className={`${classPrefix}-head`}>
        <div
          className={`${classPrefix}-head-content`}
          style={{ height: headHeight }}
        >
          {renderStatusText()}
        </div>
      </animated.div>
      <div className={`${classPrefix}-content`}>{props.children}</div>
    </animated.div>
  )
}

export const PullToRefresh = forwardRef(PullToRefresh$)
