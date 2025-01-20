# TreeSelect 级联选择器 <Experimental></Experimental>

<Alert type="error">
此组件即将重写，请尽量不要使用。
</Alert>

## 示例

<code src="./demos/demo1.tsx"></code>

## TreeSelect

### 属性

### TreeSelect

```typescript | pure
type TreeSelectOption = {
  label: string | JSX.Element
  value: string
  children?: TreeSelectOption[]
}
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultValue | 默认选中项 | `string[]` | `[]` |
| fieldNames | 自定义 `options` 中 `label` `value` `children` 的字段 | `{ label?: string; value?: string; children?: string }` | `{}` |
| onChange | `value` 变化时触发 | `(value: string[], extend: { options: TreeSelectOption[] }) => void` | - |
| options | 级联数据 | `TreeSelectOption[]` | `[]` |
| value | 选中项 | `string[]` | `[]` |
