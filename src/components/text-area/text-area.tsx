import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import type { ReactNode } from 'react'
import { useIsomorphicLayoutEffect } from 'ahooks'
import runes from 'runes2'
import { NativeProps, withNativeProps } from '../../utils/native-props'
import { usePropsValue } from '../../utils/use-props-value'
import { mergeProps } from '../../utils/with-default-props'
import { devError } from '../../utils/dev-log'
import useInputHandleKeyDown from '../../components/input/useInputHandleKeyDown'

const classPrefix = 'adm-text-area'

export type TextAreaProps = Pick<
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  | 'autoComplete'
  | 'autoFocus'
  | 'disabled'
  | 'readOnly'
  | 'name'
  | 'onFocus'
  | 'onBlur'
  | 'onCompositionStart'
  | 'onCompositionEnd'
  | 'onClick'
  | 'onKeyDown'
> & {
  onChange?: (val: string) => void
  value?: string
  defaultValue?: string
  placeholder?: string
  rows?: number
  maxLength?: number
  showCount?: boolean | ((length: number, maxLength?: number) => ReactNode)
  autoSize?:
    | boolean
    | {
        minRows?: number
        maxRows?: number
      }
  id?: string
  onEnterPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  enterKeyHint?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send'
} & NativeProps<
    | '--font-size'
    | '--color'
    | '--placeholder-color'
    | '--disabled-color'
    | '--text-align'
    | '--count-text-align'
  >

export type TextAreaRef = {
  clear: () => void
  focus: () => void
  blur: () => void
  nativeElement: HTMLTextAreaElement | null
}

const defaultProps = {
  rows: 2,
  showCount: false as NonNullable<TextAreaProps['showCount']>,
  autoSize: false as NonNullable<TextAreaProps['autoSize']>,
  defaultValue: '',
}

export const TextArea = forwardRef<TextAreaRef, TextAreaProps>(
  (p: TextAreaProps, ref) => {
    const props = mergeProps(defaultProps, p)
    const { autoSize, showCount, maxLength } = props
    const [value, setValue] = usePropsValue({
      ...props,
      value: props.value === null ? '' : props.value,
    })
    if (props.value === null) {
      devError(
        'TextArea',
        '`value` prop on `TextArea` should not be `null`. Consider using an empty string to clear the component.'
      )
    }
    const nativeTextAreaRef = useRef<HTMLTextAreaElement>(null)
    // https://github.com/ant-design/ant-design-mobile/issues/5961
    const heightRef = useRef<string>('auto')
    // https://github.com/ant-design/ant-design-mobile/issues/6051
    const hiddenTextAreaRef = useRef<HTMLTextAreaElement>(null)

    const handleKeydown = useInputHandleKeyDown({
      onEnterPress: props.onEnterPress,
      onKeyDown: props.onKeyDown,
      nativeInputRef: nativeTextAreaRef,
      enterKeyHint: props.enterKeyHint,
    })

    useImperativeHandle(ref, () => ({
      clear: () => {
        setValue('')
      },
      focus: () => {
        nativeTextAreaRef.current?.focus()
      },
      blur: () => {
        nativeTextAreaRef.current?.blur()
      },
      get nativeElement() {
        return nativeTextAreaRef.current
      },
    }))

    useIsomorphicLayoutEffect(() => {
      if (!autoSize) return
      const textArea = nativeTextAreaRef.current
      const hiddenTextArea = hiddenTextAreaRef.current
      if (!textArea) return
      textArea.style.height = heightRef.current
      if (!hiddenTextArea) return
      let height = hiddenTextArea.scrollHeight
      if (typeof autoSize === 'object') {
        const computedStyle = window.getComputedStyle(textArea)
        const lineHeight = parseFloat(computedStyle.lineHeight)
        if (autoSize.minRows) {
          height = Math.max(height, autoSize.minRows * lineHeight)
        }
        if (autoSize.maxRows) {
          height = Math.min(height, autoSize.maxRows * lineHeight)
        }
      }
      heightRef.current = `${height}px`
      textArea.style.height = `${height}px`
    }, [value, autoSize])

    const compositingRef = useRef(false)

    // https://github.com/ant-design/ant-design-mobile/issues/6391
    const maxLengthDataRef = useRef({
      isMaxLength: false,
      cacheSelectionEnd: 0,
      cacheValueLength: 0,
    })

    let count
    const valueLength = runes(value).length
    if (typeof showCount === 'function') {
      count = showCount(valueLength, maxLength)
    } else if (showCount) {
      count = (
        <div className={`${classPrefix}-count`}>
          {maxLength === undefined
            ? valueLength
            : valueLength + '/' + maxLength}
        </div>
      )
    }

    let rows = props.rows
    if (typeof autoSize === 'object') {
      if (autoSize.maxRows && rows > autoSize.maxRows) {
        rows = autoSize.maxRows
      }
      if (autoSize.minRows && rows < autoSize.minRows) {
        rows = autoSize.minRows
      }
    }

    return withNativeProps(
      props,
      <div className={classPrefix}>
        <textarea
          ref={nativeTextAreaRef}
          className={`${classPrefix}-element`}
          rows={rows}
          value={value}
          placeholder={props.placeholder}
          onChange={e => {
            let v = e.target.value
            const configValue = runes(v)
            if (maxLength && !compositingRef.current) {
              if (
                maxLengthDataRef.current.isMaxLength &&
                configValue.length > maxLength
              )
                return
              v = configValue.slice(0, maxLength).join('')
              maxLengthDataRef.current.isMaxLength =
                configValue.length >= maxLength
            }
            setValue(v)
          }}
          id={props.id}
          onCompositionStart={e => {
            compositingRef.current = true
            const { selectionEnd, value } = e.target as HTMLTextAreaElement
            maxLengthDataRef.current.cacheSelectionEnd = selectionEnd
            maxLengthDataRef.current.cacheValueLength = value.length
            props.onCompositionStart?.(e)
          }}
          onCompositionEnd={e => {
            compositingRef.current = false
            const v = (e.target as HTMLTextAreaElement).value
            const configValue = runes(v)
            if (maxLength && configValue.length > maxLength) {
              const { cacheSelectionEnd, cacheValueLength } =
                maxLengthDataRef.current
              configValue.splice(
                cacheSelectionEnd + maxLength - cacheValueLength,
                configValue.length - maxLength
              )
              setValue(configValue.join(''))
            } else {
              setValue(configValue.slice(0, maxLength).join(''))
            }
            props.onCompositionEnd?.(e)
          }}
          autoComplete={props.autoComplete}
          autoFocus={props.autoFocus}
          disabled={props.disabled}
          readOnly={props.readOnly}
          name={props.name}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onClick={props.onClick}
          onKeyDown={handleKeydown}
        />
        {count}

        {autoSize && (
          <textarea
            ref={hiddenTextAreaRef}
            className={`${classPrefix}-element ${classPrefix}-element-hidden`}
            value={value}
            rows={rows}
            aria-hidden
            readOnly
          />
        )}
      </div>
    )
  }
)

TextArea.defaultProps = defaultProps
