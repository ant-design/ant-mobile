import { spyElementPrototypes } from 'rc-util/lib/test/domHook'
import React from 'react'
import { fireEvent, render, testA11y } from 'testing'
import Ellipsis from '..'

const classPrefix = `adm-ellipsis`
const content =
  '蚂蚁的企业级产品是一个庞大且复杂的体系。这类产品不仅量级巨大且功能复杂，而且变动和并发频繁，常常需要设计与开发能够快速的做出响应。同时这类产品中有存在很多类似的页面以及组件，可以通过抽象得到一些稳定且高复用性的内容。'

const lineHeight = 19.5

describe('Ellipsis', () => {
  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      offsetHeight: {
        get() {
          const that = this as HTMLElement
          const charLen = (that.textContent || '').length || 1
          const rows = Math.ceil(charLen / 30)
          const styleLineHeight = parseFloat(that.style.lineHeight)
          return Math.round(rows * (styleLineHeight || lineHeight))
        },
      },
    })
  })

  test('a11y', async () => {
    await testA11y(<Ellipsis content={content} />)
  })

  test('direction start', () => {
    const { getByTestId } = render(
      <Ellipsis content={content} direction='start' data-testid='ellipsis' />
    )
    expect(getByTestId('ellipsis')).toMatchSnapshot()
  })

  test('direction middle', () => {
    const { getByTestId } = render(
      <Ellipsis content={content} direction='middle' data-testid='ellipsis' />
    )
    expect(getByTestId('ellipsis')).toMatchSnapshot()
  })

  test('direction end', () => {
    const { getByTestId } = render(
      <Ellipsis content={content} direction='end' data-testid='ellipsis' />
    )
    expect(getByTestId('ellipsis')).toMatchSnapshot()
  })

  test('multi line', () => {
    const { getByTestId } = render(
      <Ellipsis content={content} rows={3} data-testid='ellipsis' />
    )
    expect(getByTestId('ellipsis')).toMatchSnapshot()
  })

  test('expand and collapse', () => {
    const { getByTestId, getByText } = render(
      <Ellipsis
        content={content}
        expandText='expand'
        collapseText='collapse'
        data-testid='ellipsis'
      />
    )

    fireEvent.click(getByText('expand'))
    expect(getByTestId('ellipsis')).toMatchSnapshot()
    fireEvent.click(getByText('collapse'))
    expect(getByTestId('ellipsis')).toMatchSnapshot()
  })

  test('content click', () => {
    const onClick = jest.fn()
    const { getByTestId } = render(
      <Ellipsis
        content={content}
        data-testid='ellipsis'
        onContentClick={onClick}
      />
    )

    fireEvent.click(getByTestId('ellipsis'))
    expect(onClick).toBeCalled()
  })

  test('default expand should be work', () => {
    const { getByText } = render(
      <Ellipsis
        content={content}
        defaultExpanded
        expandText='expand'
        collapseText='collapse'
      />
    )

    const ellipsis = document.querySelector(`.${classPrefix}`)
    expect(ellipsis).not.toHaveTextContent('...')
    expect(ellipsis).toHaveTextContent('collapse')
    fireEvent.click(getByText('collapse'))
    expect(ellipsis).toHaveTextContent('...')
  })

  test('content not exceeded', () => {
    const { getByTestId } = render(
      <Ellipsis content='abc' data-testid='ellipsis' />
    )

    expect(getByTestId('ellipsis')).not.toHaveTextContent('...')
  })

  // https://github.com/ant-design/ant-design-mobile/issues/5726
  test('content could be undefined', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      render(<Ellipsis content={undefined} data-testid='ellipsis' />)
    }).not.toThrowError()
  })

  test('expand and collapse support ReactNode', async () => {
    const { getByText, findByText } = render(
      <Ellipsis
        content={content}
        expandText={<span>expand</span>}
        collapseText={<span>collapse</span>}
      />
    )

    expect(await findByText('expand')).toBeVisible()
    fireEvent.click(getByText('expand'))
    expect(getByText('collapse')).toBeInTheDocument()
  })

  test('non-integer line height', () => {
    const rows = 2
    const lineHeight = '16.4px'

    const { getByTestId } = render(
      <React.Fragment>
        <Ellipsis
          rows={rows}
          style={{ lineHeight }}
          content={content}
          data-testid='ellipsis'
        />
        <div style={{ lineHeight }} data-testid='maxheight'>
          {content}
        </div>
      </React.Fragment>
    )

    const { offsetHeight } = getByTestId('ellipsis') || {}
    const { offsetHeight: maxheight } = getByTestId('maxheight') || {}
    const rowsHeight = Math.round(parseFloat(lineHeight) * rows)
    const expectHeight = Math.min(rowsHeight, maxheight)

    expect(offsetHeight).toBe(expectHeight)
  })
})
