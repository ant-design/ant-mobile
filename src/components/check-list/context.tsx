import { CheckListValue } from '.'
import { createContext } from 'react'
import type { ReactNode } from 'react'

export const CheckListContext = createContext<{
  value: CheckListValue[]
  check: (val: CheckListValue) => void
  uncheck: (val: CheckListValue) => void
  activeIcon?: ReactNode
  extra?: (active: boolean) => ReactNode
  disabled?: boolean
  readOnly?: boolean
  activeSetPathMiddleware: {
    activeIconSetPath: any
    value?: any
    event?: any
    setPath: any
    index: any
  }
} | null>(null)
