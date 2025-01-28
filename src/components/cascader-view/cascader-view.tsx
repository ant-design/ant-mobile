import React, { useState, useEffect, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import classNames from 'classnames'
import Tabs from '../tabs'
import CheckList, { CheckListValue } from '../check-list'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { mergeProps } from '../../utils/with-default-props'
import { usePropsValue } from '../../utils/use-props-value'
import { useCascaderValueExtend } from './use-cascader-value-extend'
import { useConfig } from '../config-provider'
import { optionSkeleton } from './option-skeleton'
import Skeleton from '../skeleton'
import { useUpdateEffect } from 'ahooks'
import { useFieldNames } from '../../hooks'
import type { FieldNamesType, BaseOptionType } from '../../hooks'
import { cloneDeep } from 'lodash'

const classPrefix = `adm-cascader-view`

export type CascaderValue = CheckListValue

export type CascaderOption = {
  label?: string
  value?: string
  disabled?: boolean
  children?: CascaderOption[]
} & BaseOptionType

export type CascaderValueExtend = {
  items: (CascaderOption | null)[]
  isLeaf: boolean
}

export type CascaderViewProps = {
  options: CascaderOption[]
  value?: CascaderValue[] | any
  defaultValue?: CascaderValue[] | any
  onChange?: (value: CascaderValue[] | any, extend: CascaderValueExtend) => void
  placeholder?: string | ((index: number) => string)
  onTabsChange?: (index: number) => void
  activeIcon?: ReactNode
  loading?: boolean
  multiple?: boolean
  fieldNames?: FieldNamesType
  activeIconSetPath?: boolean
} & NativeProps<'--height'>

const defaultProps = {
  defaultValue: [],
}

export const CascaderView: FC<CascaderViewProps> = p => {
  const props = mergeProps(defaultProps, p)
  const { locale } = useConfig()
  const [labelName, valueName, childrenName, disabledName] = useFieldNames(
    props.fieldNames
  )
  const generateValueExtend = useCascaderValueExtend(props.options, {
    valueName,
    childrenName,
  })
  const [value, setValue] = usePropsValue({
    ...props,
    onChange: val => {
      props.onChange?.(
        val,
        props.multiple ? generateValueExtend(val as string[]) : {}
      )
    },
  })
  const [tabActiveIndex, setTabActiveIndex] = useState(0)

  const extractLevelsForMultiple = (
    value: any[],
    options: CascaderOption[],
    valueName: string,
    childrenName: string
  ) => {
    const ret: {
      selected: CascaderOption | undefined
      options: CascaderOption[]
    }[] = []

    let currentOptions = options
    let reachedEnd = false

    for (const v of value) {
      let target: CascaderOption | undefined
      ;(v as string[]).forEach(e => {
        const temp = currentOptions.find(option =>
          e.includes(option[valueName])
        )
        if (temp) {
          target = temp
        }
      })
      ret.push({
        selected: target,
        options: currentOptions,
      })
      if (!target || !target[childrenName]) {
        reachedEnd = true
        break
      }
      currentOptions = target[childrenName]
    }

    if (!reachedEnd) {
      ret.push({
        selected: undefined,
        options: currentOptions,
      })
    }

    return ret
  }

  const extractLevelsForSingle = (
    value: any[],
    options: CascaderOption[],
    valueName: string,
    childrenName: string
  ) => {
    const ret: {
      selected: CascaderOption | undefined
      options: CascaderOption[]
    }[] = []

    let currentOptions = options
    let reachedEnd = false

    for (const v of value) {
      const target = currentOptions.find(option => option[valueName] === v)
      ret.push({
        selected: target,
        options: currentOptions,
      })
      if (!target || !target[childrenName]) {
        reachedEnd = true
        break
      }
      currentOptions = target[childrenName]
    }

    if (!reachedEnd) {
      ret.push({
        selected: undefined,
        options: currentOptions,
      })
    }

    return ret
  }

  const levels = useMemo(() => {
    if (props.multiple) {
      return extractLevelsForMultiple(
        value,
        props.options,
        valueName,
        childrenName
      )
    } else {
      return extractLevelsForSingle(
        value,
        props.options,
        valueName,
        childrenName
      )
    }
  }, [value, props.options])

  useUpdateEffect(() => {
    if (!props.multiple) {
      props.onTabsChange?.(tabActiveIndex)
    }
  }, [tabActiveIndex])
  useEffect(() => {
    if (!props.multiple) {
      setTabActiveIndex(levels.length - 1)
    }
  }, [value])
  useEffect(() => {
    const max = levels.length - 1
    if (tabActiveIndex > max) {
      setTabActiveIndex(max)
    }
  }, [tabActiveIndex, levels])

  const onItemSelect = (
    selectValue: CascaderValue | CascaderValue[],
    depth: number
  ) => {
    const next = value.slice(0, depth)
    if (selectValue !== undefined) {
      next[depth] = selectValue
    }
    if (props.multiple) {
      const cloneValue = cloneDeep(value)
      cloneValue[depth] = next[depth]
      setValue(cloneValue)
    } else {
      setValue(next)
    }
  }

  const setPath = (selectValue: string, depth: number) => {
    const currentPath = cloneDeep(value)
    if (selectValue !== undefined) {
      if (!currentPath[depth]) {
        currentPath[depth] = []
      }
      currentPath[depth] = (currentPath[depth] as string[]).filter(
        (item: string) => {
          return item !== selectValue
        }
      )
      currentPath[depth].push(selectValue)
    }
    setValue(currentPath)
  }

  const whetherLoading = <T extends unknown[]>(options: T) =>
    props.loading || options === optionSkeleton

  const placeholder = props.placeholder || locale.Cascader.placeholder

  return withNativeProps(
    props,
    <div className={classPrefix}>
      <Tabs
        activeKey={tabActiveIndex.toString()}
        onChange={key => {
          const activeIndex = parseInt(key)
          setTabActiveIndex(activeIndex)
        }}
        stretch={false}
        className={`${classPrefix}-tabs`}
      >
        {levels.map((level, index) => {
          const selected = level.selected
          return (
            <Tabs.Tab
              key={index.toString()}
              title={
                <div className={`${classPrefix}-header-title`}>
                  {selected
                    ? selected[labelName]
                    : typeof placeholder === 'function'
                      ? placeholder(index)
                      : placeholder}
                </div>
              }
              forceRender
            >
              <div className={`${classPrefix}-content`}>
                {whetherLoading(level.options) ? (
                  <div className={`${classPrefix}-skeleton`}>
                    <Skeleton
                      className={`${classPrefix}-skeleton-line-1`}
                      animated
                    />
                    <Skeleton
                      className={`${classPrefix}-skeleton-line-2`}
                      animated
                    />
                    <Skeleton
                      className={`${classPrefix}-skeleton-line-3`}
                      animated
                    />
                    <Skeleton
                      className={`${classPrefix}-skeleton-line-4`}
                      animated
                    />
                  </div>
                ) : (
                  <CheckList
                    value={props.multiple ? value[index] : [value[index]]}
                    onChange={selectValue => {
                      if (props.multiple) {
                        onItemSelect(selectValue, index)
                      } else {
                        onItemSelect(selectValue[0], index)
                      }
                    }}
                    multiple={props.multiple}
                    activeSetPathMiddleware={{
                      index,
                      activeIconSetPath: props.activeIconSetPath,
                      setPath,
                    }}
                    activeIcon={props.activeIcon}
                  >
                    {level.options.map(option => {
                      let active
                      if (props.multiple) {
                        active = (value[index] as Array<any>)?.includes(
                          option[valueName]
                        )
                      } else {
                        active = value[index] === option[valueName]
                      }
                      return (
                        <CheckList.Item
                          value={option[valueName]}
                          key={option[valueName]}
                          disabled={option[disabledName]}
                          className={classNames(`${classPrefix}-item`, {
                            [`${classPrefix}-item-active`]: active,
                          })}
                        >
                          {option[labelName]}
                        </CheckList.Item>
                      )
                    })}
                  </CheckList>
                )}
              </div>
            </Tabs.Tab>
          )
        })}
      </Tabs>
    </div>
  )
}
