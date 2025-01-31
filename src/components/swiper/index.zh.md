# Swiper 走马灯

一组轮播的区域。

## 何时使用

- 当有一组平级的内容。
- 当内容空间不足时，可以用走马灯的形式进行收纳，进行轮播展现。
- 常用于一组图片或卡片轮播。

## 示例

### 基础用法

<code src="./demos/demo1.tsx"></code>

### 不是满宽的滑块

<code src="./demos/demo4.tsx"></code>

### 指示器

<code src="./demos/demo2.tsx"></code>

### 全屏引导

<code src="./demos/demo3.tsx"></code>

### 竖向

当你使用竖向的 Swiper 时，请务必通过 `--height` CSS 变量设置一下它的高度，否则 Swiper 的会显示异常。

<code src="./demos/demo5.tsx"></code>

### 虚拟滚动

通过 `total` 与 `renderProps` 渲染，不支持 `loop`

<code src="./demos/demo8.tsx"></code>

<code src="./demos/demo6.tsx" debug></code>

<code src="./demos/demo7.tsx" debug></code>

## Swiper

### 属性

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| allowTouchMove | 是否允许手势滑动 | `boolean` | `true` |
| autoplay | 是否自动切换 | `boolean` | `false` | `reverse` |
| autoplayInterval | 自动切换的间隔，单位为 `ms` | `number` | `3000` |
| defaultIndex | 初始位置 | `number` | `0` |
| direction | 方向，默认是水平方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| indicator | 自定义指示器 | `(total: number, current: number) => ReactNode` | - |
| indicatorProps | 指示器的相关属性 | 支持 [PageIndicator](/zh/components/page-indicator) 的 `color` `style` `className` 属性 | - |
| loop | 是否循环 | `boolean` | `false` |
| onIndexChange | 切换时触发 | `(index: number) => void` | - |
| rubberband | 是否在拖动超出内容区域时启用橡皮筋效果，仅在非 `loop` 模式下生效 | `boolean` | `true` |
| slideSize | 滑块的宽度百分比 | `number` | `100` |
| stuckAtBoundary | 是否在边界两边卡住，避免出现空白，仅在非 `loop` 模式且 `slideSize` < 100 时生效 | `boolean` | `true` |
| trackOffset | 滑块轨道整体的偏移量百分比 | `number` | `0` |
| total | 虚拟滚动时渲染总数，需要配合 renderProps 一同使用。（不支持 `loop`） | `number` | 5.34.0 |
| stopPropagation | 阻止某些事件的冒泡 | `PropagationEvent[]` | `[]` | 5.28.0 |

```ts
type PropagationEvent = 'mouseup' | 'mousemove' | 'mousedown'
```

### CSS 变量

| 属性            | 说明                 | 默认值 |
| --------------- | -------------------- | ------ |
| --border-radius | 整体组件的圆角       | `0`    |
| --height        | 高度                 | `auto` |
| --track-padding | 轨道区域的 `padding` | `0`    |
| --width         | 宽度                 | `100%` |

### Ref

| 属性      | 说明           | 类型                                          |
| --------- | -------------- | --------------------------------------------- |
| swipeNext | 切换到下一张   | `() => void`                                  |
| swipePrev | 切换到上一张   | `() => void`                                  |
| swipeTo   | 切换到指定索引 | `(index: number, immediate?: boolean) => void` |

## Swiper.Item

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| onClick | 点击滑块时触发 | `(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void` | - |
