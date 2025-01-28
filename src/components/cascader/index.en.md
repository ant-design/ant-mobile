# Cascader

Selection of multi-level data.

## When to Use

You need to select from a set of related data sets, such as provinces, municipalities, company levels, classifications of things, etc.

## Demos

<code src="./demos/demo1.tsx"></code>

<code src="./demos/demo2.tsx"></code>

## Cascader

### Props

```typescript | pure
type CascaderValue = string | null

type CascaderOption = {
  label: string
  value: string
  disabled?: boolean
  children?: CascaderOption[]
}

type CascaderValueExtend = {
  items: (CascaderOption | null)[]
  isLeaf: boolean
}
```

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| multiple | Whether to support selecting multiple options | `boolean` | false |
| activeIcon | The icon displayed when selected | `ReactNode` | - |
| cancelText | Text of the cancel button | `ReactNode` | `'取消'` |
| children | Render function of the selected options | `(items: CascaderOption[], actions: CascaderActions) => ReactNode` | - |
| confirmText | Text of the ok button | `ReactNode` | `'确定'` |
| defaultValue | Default selected options | `CascaderValue[]` | `[]` |
| destroyOnClose | Destroy `dom` when not visible | `boolean` | `true` |
| forceRender | Render content forcely | `boolean` | `false` |
| onCancel | Triggered when cancelling | `() => void` | - |
| onClose | Triggered when confirming or cancelling | `() => void` | - |
| onConfirm | Triggered when confirming | `(value: CascaderValue[], extend: CascaderValueExtend) => void` | - |
| onSelect | Triggered when the selected options are changed | `(value: CascaderValue[], extend: CascaderValueExtend) => void` | - |
| onTabsChange | Callback when switching panel | `(index: number) => void` | - |
| options | Data of the cascade options | `CascaderOption[]` | - |
| placeholder | Hint text | `string` | `'请选择'` |
| title | Title | `ReactNode` | - |
| value | Selected options | `CascaderValue[]` | - |
| visible | Whether to show or hide the Picker | `boolean` | `false` |
| loading | Open the skeleton screen | `boolean` | `false` |

Please pay attention to the `children` property of `CascaderOption`. If the `children` of an `option` is `[]`, then when the user selects this `option`, the Cascader component will automatically jump to the next level, even if There are currently no options at this level (because Cascader has no way to determine whether this empty array will become an array with content in subsequent updates). Therefore, please make sure that the `children` property of the last level option (aka "leaf node") does not exist or has the value `undefined`, so that the Cascader component can correctly recognize it.

### CascaderActions

| Name   | Description                           | Type         |
| ------ | ------------------------------------- | ------------ |
| close  | Close Cascader.                       | `() => void` |
| open   | Open Cascader.                        | `() => void` |
| toggle | Toggle the visible state of Cascader. | `() => void` |

### Ref

Same as CascaderActions.

### Loading <Experimental></Experimental>

You can pass `Cascader.optionSkeleton` as `CascaderOption[]` to the `options` property of Cascader or the `children` of `CascaderOption`. Cascader will recognize it and display the skeleton screen effect.
