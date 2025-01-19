import { useEvent } from 'rc-util'
import React from 'react'
import runes from 'runes2'

const enum MEASURE_STATUS {
  PREPARE = 1,
  MEASURE_WALKING = 2,
  STABLE_ELLIPSIS = 99,
  STABLE_NO_ELLIPSIS = 100,
}

const ELLIPSIS_TEXT = '...'

const measureStyle: React.CSSProperties = {
  visibility: 'hidden',
  whiteSpace: 'inherit',
  lineHeight: 'inherit',
  fontSize: 'inherit',
}

export default function useMeasure(
  containerRef: React.RefObject<HTMLDivElement>,
  content: string,
  rows: number,
  direction: 'start' | 'end' | 'middle',
  expanded: boolean,
  expandNode: React.ReactElement | null,
  collapseNode: React.ReactElement | null
) {
  const contentChars = React.useMemo(() => runes(content), [content])

  const [maxHeight, setMaxHeight] = React.useState<number>(0)

  const [walkingIndexes, setWalkingIndexes] = React.useState<
    [startOffset: number, endOffset: number]
  >([0, 0])
  const midIndex = Math.ceil((walkingIndexes[0] + walkingIndexes[1]) / 2)

  const [status, setStatus] = React.useState<MEASURE_STATUS>(
    MEASURE_STATUS.STABLE_NO_ELLIPSIS
  )

  // ============================ Refs ============================
  const singleRowMeasureRef = React.useRef<HTMLDivElement>(null)
  const fullMeasureRef = React.useRef<HTMLDivElement>(null)
  const midMeasureRef = React.useRef<HTMLDivElement>(null)

  const startMeasure = useEvent(() => {
    setWalkingIndexes([
      0,
      direction === 'middle'
        ? Math.ceil(contentChars.length / 2)
        : contentChars.length,
    ])
    setStatus(MEASURE_STATUS.PREPARE)
  })

  // Initialize
  React.useLayoutEffect(() => {
    startMeasure()
  }, [contentChars, rows])

  // Measure element height
  React.useLayoutEffect(() => {
    if (status === MEASURE_STATUS.PREPARE) {
      const fullMeasureHeight = fullMeasureRef.current?.offsetHeight || 0
      const singleRowMeasureHeight =
        singleRowMeasureRef.current?.offsetHeight || 0
      const rowMeasureHeight = singleRowMeasureHeight * (rows + 0.5)

      if (fullMeasureHeight <= rowMeasureHeight) {
        setStatus(MEASURE_STATUS.STABLE_NO_ELLIPSIS)
      } else {
        setMaxHeight(rowMeasureHeight)
        setStatus(MEASURE_STATUS.MEASURE_WALKING)
      }
    }
  }, [status])

  // Walking measure
  React.useLayoutEffect(() => {
    if (status === MEASURE_STATUS.MEASURE_WALKING) {
      const diff = walkingIndexes[1] - walkingIndexes[0]
      const midHeight = midMeasureRef.current?.offsetHeight || 0

      if (diff > 1) {
        if (midHeight > maxHeight) {
          setWalkingIndexes([walkingIndexes[0], midIndex])
        } else {
          setWalkingIndexes([midIndex, walkingIndexes[1]])
        }
      } else {
        if (midHeight > maxHeight) {
          setWalkingIndexes([walkingIndexes[0], walkingIndexes[0]])
        } else {
          setWalkingIndexes([walkingIndexes[1], walkingIndexes[1]])
        }
        setStatus(MEASURE_STATUS.STABLE_ELLIPSIS)
      }
    }
  }, [status, walkingIndexes])

  // =========================== Render ===========================
  /** Render by cut index */
  const renderContent = (index: number) => {
    const prefixContent = contentChars.slice(0, index)
    const suffixContent = contentChars.slice(contentChars.length - index)

    return (
      <>
        {direction === 'start' && (
          <>
            {expandNode}
            {ELLIPSIS_TEXT}
          </>
        )}
        {direction !== 'start' && prefixContent.join('')}
        {direction === 'middle' && (
          <>
            {ELLIPSIS_TEXT}
            {expandNode}
            {ELLIPSIS_TEXT}
          </>
        )}
        {direction !== 'end' && suffixContent.join('')}
        {direction === 'end' && (
          <>
            {ELLIPSIS_TEXT}
            {expandNode}
          </>
        )}
      </>
    )
  }

  const finalContent = React.useMemo(() => {
    if (expanded || status === MEASURE_STATUS.STABLE_NO_ELLIPSIS) {
      return (
        <React.Fragment key='display'>
          {content}
          {status === MEASURE_STATUS.STABLE_ELLIPSIS && collapseNode}
        </React.Fragment>
      )
    }

    if (status === MEASURE_STATUS.STABLE_ELLIPSIS) {
      return renderContent(midIndex)
    }

    return null
  }, [expanded, status, content, collapseNode, midIndex])

  const allNodes = (
    <>
      {/******************* Measure Prepare *******************/}
      {/* Origin full content */}
      {status === MEASURE_STATUS.PREPARE && (
        <div key='full' aria-hidden ref={fullMeasureRef} style={measureStyle}>
          {content}
          {expandNode}
        </div>
      )}

      {/* Row measure */}
      {status === MEASURE_STATUS.PREPARE && (
        <div
          key='stable'
          aria-hidden
          ref={singleRowMeasureRef}
          style={measureStyle}
        >
          {'\u00A0'}
        </div>
      )}

      {/******************* Measure Walking *******************/}
      {status === MEASURE_STATUS.MEASURE_WALKING && (
        <div
          key='walking-mid'
          aria-hidden
          ref={midMeasureRef}
          style={measureStyle}
        >
          {renderContent(midIndex)}
        </div>
      )}

      {/*********************** Display ***********************/}
      {/* Display content */}
      {finalContent}
    </>
  )

  return [allNodes, startMeasure] as const
}
