import classNames from 'classnames'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isoWeek from 'dayjs/plugin/isoWeek'
import React, {
  ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { usePropsValue } from '../../utils/use-props-value'
import { mergeProps } from '../../utils/with-default-props'
import { useConfig } from '../config-provider'
import {
  DateRange,
  Page,
  convertPageToDayjs,
  convertValueToRange,
} from './convert'
import useSyncScroll from './useSyncScroll'

dayjs.extend(isoWeek)
dayjs.extend(isSameOrBefore)

const classPrefix = 'adm-calendar-picker-view'

export const Context = React.createContext<{
  visible: boolean
}>({
  visible: false,
})

export type CalendarPickerViewRef = {
  jumpTo: (page: Page | ((page: Page) => Page)) => void
  jumpToToday: () => void
  getDateRange: () => DateRange
}

export type CalendarPickerViewColumRender = (date: Date) => ReactNode

export type CalendarPickerViewProps = {
  title?: React.ReactNode | false
  confirmText?: string
  weekStartsOn?: 'Monday' | 'Sunday'
  renderTop?: CalendarPickerViewColumRender | false
  renderDate?: CalendarPickerViewColumRender
  renderBottom?: CalendarPickerViewColumRender | false
  allowClear?: boolean
  max?: Date
  min?: Date
  shouldDisableDate?: (date: Date) => boolean
} & (
  | {
      selectionMode?: undefined
      value?: undefined
      defaultValue?: undefined
      onChange?: undefined
    }
  | {
      selectionMode: 'single'
      value?: Date | null
      defaultValue?: Date | null
      onChange?: (val: Date | null) => void
    }
  | {
      selectionMode: 'range'
      value?: [Date, Date] | null
      defaultValue?: [Date, Date] | null
      onChange?: (val: [Date, Date] | null) => void
    }
) &
  NativeProps

const defaultProps = {
  weekStartsOn: 'Sunday',
  defaultValue: null,
  allowClear: true,
  usePopup: true,
  selectionMode: 'single',
}

type RowProps = {
  index: number
  style: React.CSSProperties
}

type Cell = {
  year: number
  month: number
  daysInMonth: number
  monthIterator: dayjs.Dayjs
}

// default 每个月的高度是 344px
const defaultMonthHeight = 344

export const CalendarPickerView = forwardRef<
  CalendarPickerViewRef,
  CalendarPickerViewProps
>((p, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const today = dayjs()
  const props = mergeProps(defaultProps, p)
  const { locale } = useConfig()

  // 修改为虚拟滚动后不能固定高度, 所以需要创建用户自定义日历后的月份高度来确定虚拟滚动 List 的高度
  const [monthPlaceholderHeight, setMonthPlaceholderHeight] =
    useState(defaultMonthHeight)
  const [isPlaceholderRendered, setIsPlaceholderRendered] = useState(true)
  const monthPlaceholderRef = useRef<HTMLDivElement>(null)

  const markItems = [...locale.Calendar.markItems]
  if (props.weekStartsOn === 'Sunday') {
    const item = markItems.pop()
    if (item) markItems.unshift(item)
  }

  const [dateRange, setDateRange] = usePropsValue<DateRange>({
    value:
      props.value === undefined
        ? undefined
        : convertValueToRange(props.selectionMode, props.value),
    defaultValue: convertValueToRange(props.selectionMode, props.defaultValue),
    onChange: v => {
      if (props.selectionMode === 'single') {
        props.onChange?.(v ? v[0] : null)
      } else if (props.selectionMode === 'range') {
        props.onChange?.(v)
      }
    },
  })

  const [intermediate, setIntermediate] = useState(false)

  const [current, setCurrent] = useState(() =>
    dayjs(dateRange ? dateRange[0] : today).date(1)
  )

  const onDateChange = (v: DateRange) => {
    if (v) {
      setCurrent(dayjs(v[0]).date(1))
    }

    setDateRange(v)
  }

  const showHeader = props.title !== false

  // =============================== Scroll ===============================
  const context = useContext(Context)
  const scrollTo = useSyncScroll(current, context.visible, bodyRef)

  // ============================== Boundary ==============================
  // 记录默认的 min 和 max，并在外部的值超出边界时自动扩充
  const [defaultMin, setDefaultMin] = useState(current)
  const [defaultMax, setDefaultMax] = useState(() => current.add(6, 'month'))

  useEffect(() => {
    if (dateRange) {
      const [startDate, endDate] = dateRange
      if (!props.min && startDate && dayjs(startDate).isBefore(defaultMin)) {
        setDefaultMin(dayjs(startDate).date(1))
      }

      if (!props.max && endDate && dayjs(endDate).isAfter(defaultMax)) {
        setDefaultMax(dayjs(endDate).endOf('month'))
      }
    }
  }, [dateRange])

  // 用来获取计算用户自定义日历的月份高度 获取到后隐藏掉这个基础款月份 dom
  useEffect(() => {
    if (monthPlaceholderRef.current) {
      const calculatedHeight = monthPlaceholderRef.current.offsetHeight
      if (calculatedHeight) {
        setMonthPlaceholderHeight(calculatedHeight)
      }
      setIsPlaceholderRendered(false)
    }
  }, [])

  const maxDay = useMemo(
    () => (props.max ? dayjs(props.max) : defaultMax),
    [props.max, defaultMax]
  )
  const minDay = useMemo(
    () => (props.min ? dayjs(props.min) : defaultMin),
    [props.min, defaultMin]
  )

  // ================================ Refs ================================
  useImperativeHandle(ref, () => ({
    jumpTo: pageOrPageGenerator => {
      let page: Page
      if (typeof pageOrPageGenerator === 'function') {
        page = pageOrPageGenerator({
          year: current.year(),
          month: current.month() + 1,
        })
      } else {
        page = pageOrPageGenerator
      }
      const next = convertPageToDayjs(page)
      setCurrent(next)
      scrollTo(next)
    },
    jumpToToday: () => {
      const next = dayjs().date(1)
      setCurrent(next)
      scrollTo(next)
    },
    getDateRange: () => dateRange,
  }))

  // =============================== Render ===============================
  const header = (
    <div className={`${classPrefix}-header`}>
      <div className={`${classPrefix}-title`}>
        {props.title ?? locale.Calendar.title}
      </div>
    </div>
  )

  // =============================== Render Month Body ===============================

  const renderMonthTitle = (year: number, month: number) => {
    const renderMap = { year, month }
    return locale.Calendar.yearAndMonth?.replace(
      /\${(.*?)}/g,
      (_, variable: keyof typeof renderMap) => {
        return renderMap[variable]?.toString()
      }
    )
  }

  const getPresetEmptyCells = (monthIterator: dayjs.Dayjs) => {
    const presetEmptyCellCount =
      props.weekStartsOn === 'Monday'
        ? monthIterator.date(1).isoWeekday() - 1
        : monthIterator.date(1).isoWeekday()

    return presetEmptyCellCount === 7
      ? null
      : Array.from({ length: presetEmptyCellCount }).map((_, index) => (
          <div key={index} className={`${classPrefix}-cell`}></div>
        ))
  }

  const getDateStatus = (d: dayjs.Dayjs, cells: Cell[]) => {
    let isSelect = false
    let isBegin = false
    let isEnd = false
    let isSelectRowBegin = false
    let isSelectRowEnd = false
    if (dateRange) {
      const [begin, end] = dateRange
      isBegin = d.isSame(begin, 'day')
      isEnd = d.isSame(end, 'day')
      isSelect =
        isBegin || isEnd || (d.isAfter(begin, 'day') && d.isBefore(end, 'day'))
      if (isSelect) {
        isSelectRowBegin =
          (cells.length % 7 === 0 || d.isSame(d.startOf('month'), 'day')) &&
          !isBegin
        isSelectRowEnd =
          (cells.length % 7 === 6 || d.isSame(d.endOf('month'), 'day')) &&
          !isEnd
      }
    }
    const disabled = props.shouldDisableDate
      ? props.shouldDisableDate(d.toDate())
      : (maxDay && d.isAfter(maxDay, 'day')) ||
        (minDay && d.isBefore(minDay, 'day'))

    return {
      isSelect,
      isBegin,
      isEnd,
      isSelectRowBegin,
      isSelectRowEnd,
      disabled,
    }
  }

  const handleDateClick = (d: dayjs.Dayjs, disabled: boolean) => {
    if (!props.selectionMode) return
    if (disabled) return
    const date = d.toDate()
    function shouldClear() {
      if (!props.allowClear) return false
      if (!dateRange) return false
      const [begin, end] = dateRange
      return d.isSame(begin, 'date') && d.isSame(end, 'day')
    }
    if (props.selectionMode === 'single') {
      if (props.allowClear && shouldClear()) {
        onDateChange(null)
        return
      }
      onDateChange([date, date])
    } else if (props.selectionMode === 'range') {
      if (!dateRange) {
        onDateChange([date, date])
        setIntermediate(true)
        return
      }
      if (shouldClear()) {
        onDateChange(null)
        setIntermediate(false)
        return
      }
      if (intermediate) {
        const another = dateRange[0]
        onDateChange(another > date ? [date, another] : [another, date])
        setIntermediate(false)
      } else {
        onDateChange([date, date])
        setIntermediate(true)
      }
    }
  }

  const renderDays = (
    monthIterator: dayjs.Dayjs,
    daysInMonth: number,
    cells: Cell[]
  ) => {
    return Array.from({ length: daysInMonth }).map((_, index) => {
      const d = monthIterator.date(index + 1)

      const {
        isSelect,
        isBegin,
        isEnd,
        isSelectRowBegin,
        isSelectRowEnd,
        disabled,
      } = getDateStatus(d, cells)

      const renderTop = () => {
        if (props.renderTop === false) return null

        const contentWrapper = (content: ReactNode) => (
          <div className={`${classPrefix}-cell-top`}>{content}</div>
        )

        const top = props.renderTop?.(d.toDate())

        if (top) {
          return contentWrapper(top)
        }

        if (props.selectionMode === 'range') {
          if (isBegin) {
            return contentWrapper(locale.Calendar.start)
          }

          if (isEnd) {
            return contentWrapper(locale.Calendar.end)
          }
        }

        if (d.isSame(today, 'day') && !isSelect) {
          return contentWrapper(locale.Calendar.today)
        }

        return contentWrapper(null)
      }

      const renderBottom = () => {
        if (props.renderBottom === false) return null

        return (
          <div className={`${classPrefix}-cell-bottom`}>
            {props.renderBottom?.(d.toDate())}
          </div>
        )
      }

      return (
        <div
          key={d.valueOf()}
          className={classNames(`${classPrefix}-cell`, {
            [`${classPrefix}-cell-today`]: d.isSame(today, 'day'),
            [`${classPrefix}-cell-selected`]: isSelect,
            [`${classPrefix}-cell-selected-begin`]: isBegin,
            [`${classPrefix}-cell-selected-end`]: isEnd,
            [`${classPrefix}-cell-selected-row-begin`]: isSelectRowBegin,
            [`${classPrefix}-cell-selected-row-end`]: isSelectRowEnd,
            [`${classPrefix}-cell-disabled`]: !!disabled,
          })}
          onClick={() => {
            handleDateClick(d, disabled)
          }}
        >
          {renderTop()}
          <div className={`${classPrefix}-cell-date`}>
            {props.renderDate ? props.renderDate(d.toDate()) : d.date()}
          </div>
          {renderBottom()}
        </div>
      )
    })
  }

  // 获取用户自定义后的月份面板高度
  const renderPlaceholderMonths = () => {
    const monthIterator = minDay.clone()
    const year = monthIterator.year()
    const month = monthIterator.month() + 1
    const daysInMonth = monthIterator.daysInMonth()
    const presetEmptyCells = getPresetEmptyCells(monthIterator)

    return (
      <div ref={monthPlaceholderRef}>
        <div className={`${classPrefix}-title`}>
          {renderMonthTitle(year, month)}
        </div>
        <div className={`${classPrefix}-cells`}>
          {/* 空格填充 */}
          {presetEmptyCells}
          {/* 遍历每月 */}
          {renderDays(monthIterator, daysInMonth, [])}
        </div>
      </div>
    )
  }

  function renderBody() {
    const totalMonths = Math.ceil(maxDay.diff(minDay, 'months', true))

    const cells: Cell[] = []
    let monthIterator = minDay.clone()

    while (monthIterator.isSameOrBefore(maxDay, 'month')) {
      const year = monthIterator.year()
      const month = monthIterator.month() + 1
      const daysInMonth = monthIterator.daysInMonth()

      cells.push({ year, month, daysInMonth, monthIterator })
      monthIterator = monthIterator.add(1, 'month')
    }

    const Row = ({ index, style }: RowProps) => {
      const { year, month, daysInMonth, monthIterator } = cells[index]

      const yearMonth = `${year}-${month}`

      // 获取需要预先填充的空格，如果是 7 天则不需要填充
      const presetEmptyCells = getPresetEmptyCells(monthIterator)

      return (
        <div style={style} key={yearMonth} data-year-month={yearMonth}>
          <div className={`${classPrefix}-title`}>
            {renderMonthTitle(year, month)}
          </div>
          <div className={`${classPrefix}-cells`}>
            {/* 空格填充 */}
            {presetEmptyCells}
            {/* 遍历每月 */}
            {renderDays(monthIterator, daysInMonth, cells)}
          </div>
        </div>
      )
    }

    return (
      <>
        {isPlaceholderRendered && renderPlaceholderMonths()}
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={totalMonths}
              itemSize={monthPlaceholderHeight}
              width={width}
              className={`${classPrefix}-no-scrollbar`}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </>
    )
  }

  const body = (
    <div className={`${classPrefix}-body`} ref={bodyRef}>
      {renderBody()}
    </div>
  )

  const mark = (
    <div className={`${classPrefix}-mark`}>
      {markItems.map((item, index) => (
        <div key={index} className={`${classPrefix}-mark-cell`}>
          {item}
        </div>
      ))}
    </div>
  )

  return withNativeProps(
    props,
    <div className={classPrefix}>
      {showHeader && header}
      {mark}
      {body}
    </div>
  )
})
