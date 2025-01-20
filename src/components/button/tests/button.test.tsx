import React, { createRef } from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  sleep,
  testA11y,
  waitFor,
} from 'testing'
import type { ButtonRef } from '..'
import Button from '../'

const classPrefix = `adm-button`

describe('Button', () => {
  test('a11y', async () => {
    await testA11y(<Button>test</Button>)
  })

  test('renders with color', () => {
    const { getByText } = render(
      <>
        <Button color='primary'>Primary</Button>
        <Button color='success'>Success</Button>
        <Button color='danger'>Danger</Button>
        <Button color='warning'>Warning</Button>
        <Button color='link'>Link</Button>
      </>
    )
    expect(getByText('Primary').closest('button')).toHaveClass(
      `${classPrefix}-primary`
    )
    expect(getByText('Success').closest('button')).toHaveClass(
      `${classPrefix}-success`
    )
    expect(getByText('Danger').closest('button')).toHaveClass(
      `${classPrefix}-danger`
    )
    expect(getByText('Warning').closest('button')).toHaveClass(
      `${classPrefix}-warning`
    )
    expect(getByText('Link').closest('button')).toHaveClass(
      `${classPrefix}-link`
    )
  })

  test('renders with fill', () => {
    const { getByText } = render(
      <>
        <Button fill='solid'>solid</Button>
        <Button fill='outline'>outline</Button>
        <Button fill='none'>none</Button>
      </>
    )
    expect(getByText('outline').closest('button')).toHaveClass(
      `${classPrefix}-fill-outline`
    )
    expect(getByText('none').closest('button')).toHaveClass(
      `${classPrefix}-fill-none`
    )
    expect(getByText('solid').closest('button')).not.toHaveClass(
      `${classPrefix}-fill-solid`
    )
  })

  test('renders with size', () => {
    const { getByText } = render(
      <>
        <Button size='mini' color='primary'>
          Mini
        </Button>
        <Button size='small' color='primary'>
          Small
        </Button>
        <Button size='middle' color='primary'>
          Middle
        </Button>
        <Button size='large' color='primary'>
          Large
        </Button>
      </>
    )
    expect(getByText('Mini').closest('button')).toHaveClass(
      `${classPrefix}-mini`
    )
    expect(getByText('Small').closest('button')).toHaveClass(
      `${classPrefix}-small`
    )
    expect(getByText('Middle').closest('button')).toHaveClass(`${classPrefix}`)
    expect(getByText('Large').closest('button')).toHaveClass(
      `${classPrefix}-large`
    )
  })

  test('renders with block', () => {
    const { getByText } = render(
      <Button block color='primary' size='large'>
        Block
      </Button>
    )
    expect(getByText('Block').closest('button')).toHaveClass(
      `${classPrefix}-block`
    )
  })

  test('renders with disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>)
    const button = getByRole('button')
    expect(button).toBeDisabled()
  })

  test('loading with custom loadingText and loadingIcon', () => {
    const { getByTestId } = render(
      <Button
        loading
        data-testid='btn'
        loadingText='加载中'
        loadingIcon={<div>loadingIcon</div>}
      >
        Loading
      </Button>
    )
    expect(getByTestId('btn')).toHaveClass(`${classPrefix}-loading`)

    // children no render
    expect(() => {
      screen.getByText('Loading')
    }).toThrow(/Unable to find an element with the text: Loading./)

    screen.getByText('加载中')
    screen.getByText('loadingIcon')
  })

  test('renders with type', () => {
    const { getByRole } = render(<Button type='submit'>submit</Button>)
    const button = getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).not.toHaveAttribute('type', 'button')
  })

  test('renders with onClick', () => {
    class DefaultButton extends React.Component {
      state = {
        loading: false,
      }

      enterLoading = () => {
        this.setState({ loading: true })
      }

      render() {
        const { loading } = this.state
        return (
          <Button
            loading={loading}
            loadingText='加载中'
            onClick={this.enterLoading}
          >
            Button
          </Button>
        )
      }
    }
    const { getByText } = render(<DefaultButton />)
    fireEvent.click(getByText('Button'))
    screen.getByText('加载中')
  })

  test('renders with async onClick and auto loading', async () => {
    jest.useFakeTimers()
    const { getByText } = render(
      <Button
        loading='auto'
        loadingText='加载中'
        onClick={async () => {
          await sleep(300)
        }}
      >
        Button
      </Button>
    )

    fireEvent.click(getByText('Button'))
    await waitFor(async () => {
      expect(screen.getByText('加载中')).toBeInTheDocument()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
    await waitFor(async () => {
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
    jest.useRealTimers()
  })

  test('ref should work', async () => {
    const ref = createRef<ButtonRef>()
    render(<Button ref={ref}>Button</Button>)
    expect(ref.current).toBeDefined()
    expect(ref.current?.nativeElement).toBeDefined()
  })

  test('renders with async onClick and auto loading when Promise reject', async () => {
    const error = new Error('mock request fail')
    const mockFail = jest.fn().mockRejectedValue(error)
    const { getByText } = render(
      <Button
        loading='auto'
        loadingText='加载中'
        onClick={async () => {
          await expect(mockFail).rejects.toBe(error)
        }}
      >
        Button
      </Button>
    )
    await waitFor(async () => {
      fireEvent.click(getByText('Button'))
      screen.getByText('加载中')
      await sleep(100)
      screen.getByText('Button')
    })
  })
})
