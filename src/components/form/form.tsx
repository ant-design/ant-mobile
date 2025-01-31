import React, { forwardRef, useMemo } from 'react'
import type { ReactNode, ForwardedRef } from 'react'
import classNames from 'classnames'
import { NativeProps } from '../../utils/native-props'
import List, { ListProps } from '../list'
import RcForm from 'rc-field-form'
import type {
  FormProps as RcFormProps,
  FormInstance as RCFormInstance,
} from 'rc-field-form'
import { defaultFormContext, FormContext, FormContextType } from './context'
import { mergeProps } from '../../utils/with-default-props'
import { Header } from './header'
import { useConfig } from '../config-provider'
import merge from 'deepmerge'
import { FormArray } from './form-array'
import { traverseReactNode } from '../../utils/traverse-react-node'

const classPrefix = 'adm-form'

export type FormInstance = Pick<
  RCFormInstance,
  | 'getFieldValue'
  | 'getFieldsValue'
  | 'getFieldError'
  | 'getFieldsError'
  | 'isFieldTouched'
  | 'isFieldsTouched'
  | 'resetFields'
  | 'setFields'
  | 'setFieldValue'
  | 'setFieldsValue'
  | 'submit'
  | 'validateFields'
>

export type FormProps = RcFormProps &
  NativeProps<
    '--border-inner' | '--border-top' | '--border-bottom' | '--prefix-width'
  > &
  Partial<FormContextType> & {
    footer?: ReactNode
    mode?: ListProps['mode']
  }

const defaultProps = defaultFormContext

export const Form = forwardRef<FormInstance, FormProps>((p, ref) => {
  const props = mergeProps(defaultProps, p)
  const {
    className,
    style,
    hasFeedback,
    children,
    layout,
    footer,
    mode,
    disabled,
    requiredMarkStyle,
    ...formProps
  } = props

  const { locale } = useConfig()

  const validateMessages = useMemo(
    () =>
      merge(
        locale.Form.defaultValidateMessages,
        formProps.validateMessages || {}
      ),
    [locale.Form.defaultValidateMessages, formProps.validateMessages]
  )

  const lists: ReactNode[] = []

  let currentHeader: ReactNode = null
  let items: ReactNode[] = []
  let count = 0
  function collect() {
    if (items.length === 0) return
    count += 1
    lists.push(
      <List header={currentHeader} key={count} mode={mode}>
        {items}
      </List>
    )
    items = []
  }
  traverseReactNode(props.children as ReactNode, child => {
    if (React.isValidElement(child)) {
      if (child.type === Header) {
        collect()
        currentHeader = child.props.children
        return
      }
      if (child.type === FormArray) {
        collect()
        lists.push(child)
        return
      }
    }
    items.push(child)
  })
  collect()

  return (
    <RcForm
      className={classNames(classPrefix, className)}
      style={style}
      ref={ref as ForwardedRef<RCFormInstance>}
      {...formProps}
      validateMessages={validateMessages}
    >
      <FormContext.Provider
        value={{
          name: formProps.name,
          hasFeedback,
          layout,
          requiredMarkStyle,
          disabled,
        }}
      >
        {lists}
      </FormContext.Provider>
      {footer && <div className={`${classPrefix}-footer`}>{footer}</div>}
    </RcForm>
  )
})
