import React, {
  useState,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react'
import Popup, { PopupProps } from '../popup'
import {
  CascaderValue,
  CascaderValueExtend,
  CascaderOption,
} from '../cascader-view'
import { mergeProps } from '../../utils/with-default-props'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { usePropsValue } from '../../utils/use-props-value'
import CascaderView from '../cascader-view'
import { useConfig } from '../config-provider'
import { useCascaderValueExtend } from '../cascader-view/use-cascader-value-extend'
import { useFieldNames } from '../../hooks'
import type { FieldNamesType } from '../../hooks'
import { cloneDeep } from 'lodash'
import { CheckListValue } from '../check-list'

const classPrefix = `adm-cascader`

export type CascaderActions = {
  open: () => void
  close: () => void
  toggle: () => void
}
export type CascaderRef = CascaderActions

/**
 * @description 二维数组转化成树
 */
function generatePaths(options: CascaderOption[], data: CheckListValue[][]) {
  const result: string[][] = []
  function helper(
    currentOptions: any[],
    currentData: string | any[],
    path: string | any[]
  ) {
    if (currentData.length === 0) {
      if (Array.isArray(path)) {
        result.push(path)
        return
      }
    }

    const currentLevel = currentData[0]
    const remainingData = currentData.slice(1)

    let isFinish = true
    currentLevel.forEach((value: any) => {
      const option = currentOptions.find(
        (opt: { value: any }) => opt.value === value
      )
      if (option) {
        isFinish = false
        helper(option.children || [], remainingData, path.concat(option.value))
      }
    })

    if (isFinish) {
      if (Array.isArray(path)) {
        result.push(path)
        return
      }
    }
  }

  helper(options, data, [])
  return result
}

export type CascaderProps = {
  activeIconSetPath?: boolean
  options: CascaderOption[]
  multiple?: boolean
  value?: CascaderValue[] | CascaderValue[][]
  defaultValue?: CascaderValue[]
  placeholder?: string
  onSelect?: (
    value: CascaderValue[] | CascaderValue[][],
    extend: CascaderValueExtend
  ) => void
  onConfirm?: (
    value: CascaderValue[] | CascaderValue[][],
    extend: CascaderValueExtend
  ) => void
  onCancel?: () => void
  onClose?: () => void
  visible?: boolean
  title?: ReactNode
  confirmText?: ReactNode
  cancelText?: ReactNode
  loading?: boolean
  children?: (
    items: (CascaderOption | null)[],
    actions: CascaderActions
  ) => ReactNode
  onTabsChange?: (index: number) => void
  activeIcon?: ReactNode
  fieldNames?: FieldNamesType
} & Pick<
  PopupProps,
  | 'getContainer'
  | 'afterShow'
  | 'afterClose'
  | 'onClick'
  | 'stopPropagation'
  | 'destroyOnClose'
  | 'forceRender'
> &
  NativeProps

const defaultProps = {
  defaultValue: [],
  destroyOnClose: true,
  forceRender: false,
}

/**
 * @description 树转化成二维数组
 */
const dataPreview = (data: Array<CheckListValue[]>) => {
  const temp: any[] = []
  cloneDeep(data).forEach(item => {
    item.forEach((e: any, index: number) => {
      if (!temp[index]) {
        temp[index] = [e]
      } else {
        temp[index].push(e)
      }
    })
  })
  return temp
}

export const Cascader = forwardRef<CascaderRef, CascaderProps>((p, ref) => {
  const { locale } = useConfig()
  const props = mergeProps(
    defaultProps,
    {
      confirmText: locale.common.confirm,
      cancelText: locale.common.cancel,
      placeholder: locale.Cascader.placeholder,
    },
    p
  )

  const [visible, setVisible] = usePropsValue({
    value: props.visible,
    defaultValue: false,
    onChange: v => {
      if (v === false) {
        props.onClose?.()
      }
    },
  })

  const actions: CascaderActions = {
    toggle: () => {
      setVisible(v => !v)
    },
    open: () => {
      setVisible(true)
    },
    close: () => {
      setVisible(false)
    },
  }

  useImperativeHandle(ref, () => actions)

  const [value, setValue] = usePropsValue({
    ...props,
    onChange: val => {
      if (props.multiple) {
        const hash: Record<string, boolean> = {}
        let result = generatePaths(
          props.options,
          val as Array<CheckListValue[]>
        )
        result = result.filter(item => {
          if (hash[JSON.stringify(item)]) {
            return false
          } else {
            hash[JSON.stringify(item)] = true
            return true
          }
        })
        props.onConfirm?.(result, {} as any)
      } else {
        props.onConfirm?.(val, generateValueExtend(val as CheckListValue[]))
      }
    },
  })

  const [, valueName, childrenName] = useFieldNames(props.fieldNames)
  const generateValueExtend = useCascaderValueExtend(props.options, {
    valueName,
    childrenName,
  })

  let valueTemp
  if (props.multiple) {
    valueTemp = dataPreview(value as Array<CheckListValue[]>)
  } else {
    valueTemp = value as CascaderValue[]
  }
  const [innerValue, setInnerValue] = useState<
    CascaderValue[] | CascaderValue[][]
  >(valueTemp)

  useEffect(() => {
    if (!visible) {
      if (props.multiple) {
        setInnerValue(dataPreview(value as Array<CheckListValue[]>))
      } else {
        setInnerValue(value)
      }
    }
  }, [visible, value])

  const cascaderElement = withNativeProps(
    props,
    <div className={classPrefix}>
      <div className={`${classPrefix}-header`}>
        <a
          className={`${classPrefix}-header-button`}
          onClick={() => {
            props.onCancel?.()
            setVisible(false)
          }}
        >
          {props.cancelText}
        </a>
        <div className={`${classPrefix}-header-title`}>{props.title}</div>
        <a
          className={`${classPrefix}-header-button`}
          onClick={() => {
            setValue(innerValue, true)
            setVisible(false)
          }}
        >
          {props.confirmText}
        </a>
      </div>
      <div className={`${classPrefix}-body`}>
        <CascaderView
          {...props}
          value={innerValue}
          onChange={(val, ext) => {
            setInnerValue(val)
            if (visible) {
              props.onSelect?.(val, ext)
            }
          }}
        />
      </div>
    </div>
  )

  const popupElement = (
    <Popup
      visible={visible}
      position='bottom'
      onMaskClick={() => {
        props.onCancel?.()
        setVisible(false)
      }}
      getContainer={props.getContainer}
      destroyOnClose={props.destroyOnClose}
      forceRender={props.forceRender}
      afterShow={props.afterShow}
      afterClose={props.afterClose}
      onClick={props.onClick}
      stopPropagation={props.stopPropagation}
    >
      {cascaderElement}
    </Popup>
  )

  return (
    <>
      {popupElement}
      {props.children?.(
        generateValueExtend(value as CheckListValue[]).items,
        actions
      )}
    </>
  )
})
