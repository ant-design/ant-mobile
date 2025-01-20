# PullToRefresh 下拉刷新

在列表中通过手指下拉刷新加载新内容的交互操作。

## 何时使用

适用于对当前页面进行内容更新。

## 示例

### 基础用法

<code src="./demos/demo1.tsx"></code>

### 自定义提示文案

<code src="./demos/demo2.tsx"></code>

### 处理刷新失败的情况

<code src="./demos/demo3.tsx"></code>

### 内容区域存在多层嵌套

<code src="./demos/demo-nested.tsx"></code>

## PullToRefresh

### 属性

```ts | pure
type PullStatus = 'pulling' | 'canRelease' | 'refreshing' | 'complete'
```

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| canReleaseText | 释放的提示文案 | `ReactNode` | `'释放立即刷新'` |
| completeDelay | 完成后延迟消失的时间，单位为 ms | `number` | `500` |
| completeText | 完成时的提示文案 | `ReactNode` | `'刷新成功'` |
| disabled | 是否禁用下拉刷新 | `boolean` | `false` |
| headHeight | 头部提示内容区的高度，单位为 px | `number` | `40` |
| onRefresh | 触发刷新时的处理函数 | `() => Promise<any>` | - |
| pullingText | 下拉的提示文案 | `ReactNode` | `'下拉刷新'` |
| refreshingText | 刷新时的提示文案 | `ReactNode` | `'加载中……'` |
| renderText | 根据下拉状态，自定义下拉提示文案 | `(status: PullStatus) => ReactNode` | - |
| threshold | 触发刷新需要下拉多少距离，单位为 px | `number` | `60` |

### Ref

| 属性    | 说明             | 类型       |
| ------- | ---------------- | ---------- |
| refresh | 手动触发下拉刷新 | `()=>void` |

## 常见问题

### 是否支持上拉加载更多？

上拉加载更多是另一个组件：[InfiniteScroll](/zh/components/infinite-scroll)。

### 关于浏览器的默认下拉行为

一些浏览器或者 webview 容器本身会有弹性效果或下拉刷新的逻辑，我们不太建议在这种环境中使用 PullToRefresh 组件，如果你一定要用的话，请禁用掉外层浏览器默认的下拉和弹性效果，不然可能会出现 PullToRefresh 和浏览器的默认行为同时被触发的情况，从而导致用户体验比较差。
