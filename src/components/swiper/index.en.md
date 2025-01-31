# Swiper

A set of rotating areas.

## When to Use

- When there is a set of flat content.
- When the content space is insufficient, it can be stored in the form of a revolving lantern for carousel display.
- Often used for a set of images or card carousels.

## Demos

### Basic Usage

<code src="./demos/demo1.tsx"></code>

### Slides which are not full-width

<code src="./demos/demo4.tsx"></code>

### Indicators

<code src="./demos/demo2.tsx"></code>

### Full Page Guide

<code src="./demos/demo3.tsx"></code>

### Vertical

When you use a vertical Swiper, be sure to set its height through the `--height` CSS variable, otherwise the Swiper will display abnormally.

<code src="./demos/demo5.tsx"></code>

### Virtual Scroll

Use `total` with `renderProps` for render. Not support `loop`

<code src="./demos/demo8.tsx"></code>

<code src="./demos/demo6.tsx" debug></code>

<code src="./demos/demo7.tsx" debug></code>

## Swiper

### Props

| Name | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| allowTouchMove | Whether to allow gesture sliding | `boolean` | `true` |
| autoplay | Whether to switch automatically | `boolean` | `false` |
| autoplayInterval | Automatic switching interval, the unit is `ms` | `number` | `3000` |
| defaultIndex | The initial position | `number` | `0` |
| direction | Layout direction | `'horizontal' \| 'vertical'` | `'horizontal'` |
| indicator | Render a customized indicator | `(total: number, current: number) => ReactNode` | - |
| indicatorProps | Related attributes of the indicator | support [PageIndicator](/components/page-indicator) `color` `style` `className` prop | - |
| loop | Whether to loop | `boolean` | `false` |
| onIndexChange | Triggered on index is changed | `(index: number) => void` | - |
| rubberband | Whether to enable the rubberband effect. | `boolean` | `true` |
| slideSize | The slide width in percentage | `number` | `100` |
| stuckAtBoundary | Whether to stuck at boundary in order to prevent white spaces. Only available when `loop` is `false` and `slideWidth` < 100. | `boolean` | `true` |
| trackOffset | The track offset in percentage | `number` | `0` |
| total | Virtual scroll config total size which should work with renderProps. (Not support `loop`) | `number` | 5.34.0 |
| stopPropagation | Stop the propagation of some events. | `PropagationEvent[]` | `[]` | 5.28.0 |

```ts
type PropagationEvent = 'mouseup' | 'mousemove' | 'mousedown'
```

### CSS Variables

| Name            | Description                              | Default |
| --------------- | ---------------------------------------- | ------- |
| --border-radius | rounded corners of the overall component | `0`     |
| --height        | height                                   | `auto`  |
| --track-padding | `padding` in the track area              | `0`     |
| --width         | width                                    | `100%`  |

### Ref

| Name | Description | Type |
| --- | --- | --- |
| swipeNext | Switch to the next one | `() => void` |
| swipePrev | Switch to the previous one | `() => void` |
| swipeTo | Switch to the specified index | `(index: number, immediate?: boolean) => void` |

## Swiper.Item

### Props

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| onClick | Triggered when the slider is clicked | `(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void` | - |
