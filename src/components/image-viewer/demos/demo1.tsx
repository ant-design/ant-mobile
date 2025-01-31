import React, { useState } from 'react'
import { ImageViewer, Button } from 'antd-mobile'
import { DemoBlock } from 'demos'
import { demoImage, demoImages, facImages } from './images'
import styles from './demo1.less'

// 单张图片预览
const Single = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true)
        }}
      >
        显示图片
      </Button>
      <ImageViewer
        classNames={{
          mask: 'customize-mask',
          body: 'customize-body',
        }}
        image={demoImage}
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
      />
    </>
  )
}

// 多张图片预览
const Multi = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true)
        }}
      >
        显示图片
      </Button>
      <ImageViewer.Multi
        images={demoImages}
        visible={visible}
        defaultIndex={1}
        onClose={() => {
          setVisible(false)
        }}
      />
    </>
  )
}

// 自定义图片背景色
const ColorfulMulti = () => {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(1)
  const colors = [
    'rgba(164,255,164,.7)',
    'rgba(255,204,0,.7)',
    'rgba(186,114,232,.7)',
  ]
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true)
        }}
      >
        显示图片
      </Button>
      <ImageViewer.Multi
        images={facImages}
        color={colors[index]}
        visible={visible}
        defaultIndex={1}
        onClose={() => {
          setVisible(false)
        }}
        onIndexChange={setIndex}
      />
    </>
  )
}

const ViewWithFooter = () => {
  const [visible, setVisible] = useState(false)

  const renderFooter = (image: string, index: number) => {
    return (
      <div className={styles.footer}>
        <div
          className={styles.footerButton}
          onClick={() => {
            console.log('Loading...')
          }}
        >
          查看原图{index + 1}
        </div>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => {
          setVisible(true)
        }}
      >
        显示图片
      </Button>
      <ImageViewer.Multi
        images={demoImages}
        visible={visible}
        defaultIndex={1}
        onClose={() => {
          setVisible(false)
        }}
        renderFooter={renderFooter}
      />
    </>
  )
}

export default () => {
  return (
    <>
      <DemoBlock title='单张图片预览'>
        <Single />
      </DemoBlock>

      <DemoBlock title='多张图片预览'>
        <Multi />
      </DemoBlock>

      <DemoBlock title='自定义图片背景色'>
        <ColorfulMulti />
      </DemoBlock>

      <DemoBlock title='指令式调用'>
        <Button
          onClick={() => {
            ImageViewer.Multi.show({ images: demoImages })
          }}
        >
          显示图片
        </Button>
      </DemoBlock>

      <DemoBlock title='手动控制关闭'>
        <Button
          onClick={() => {
            const handler = ImageViewer.show({
              image: demoImage,
            })
            setTimeout(() => {
              handler.close()
            }, 3000)
          }}
        >
          显示图片并在3秒后关闭
        </Button>
      </DemoBlock>

      <DemoBlock title='自定义底部额外内容'>
        <ViewWithFooter />
      </DemoBlock>
    </>
  )
}
