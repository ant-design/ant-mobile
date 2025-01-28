import React, { useEffect, useState } from 'react'
import type { FC } from 'react'
import { renderToBody } from '../../utils/render-to-body'
import { Cascader } from './cascader'
import type { CascaderProps, CascaderValue } from './index'

export function prompt(
  props: Omit<CascaderProps, 'value' | 'visible' | 'children'>
) {
  return new Promise<CascaderValue[] | null | any>(resolve => {
    const Wrapper: FC = () => {
      const [visible, setVisible] = useState(false)
      useEffect(() => {
        setVisible(true)
      }, [])
      return (
        <Cascader
          {...props}
          visible={visible}
          onConfirm={(val, extend) => {
            props.onConfirm?.(val, extend)
            resolve(val)
          }}
          onClose={() => {
            props.onClose?.()
            setVisible(false)
            resolve(null)
          }}
          afterClose={() => {
            props.afterClose?.()
            unmount()
          }}
        />
      )
    }
    const unmount = renderToBody(<Wrapper />)
  })
}
