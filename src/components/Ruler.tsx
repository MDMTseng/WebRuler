import React, { useEffect, useState } from 'react'

interface RulerProps {
  pixelsPerCm: number
  onCreateLine: (isHorizontal: boolean, position: number) => void
}

const Ruler: React.FC<RulerProps> = ({ pixelsPerCm, onCreateLine }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate required ruler length in cm (add extra 10cm for safety)
  const horizontalLength = Math.ceil((dimensions.width - 50) / pixelsPerCm) + 10
  const verticalLength = Math.ceil((dimensions.height - 50) / pixelsPerCm) + 10
  
  const handleCreateLine = (e: React.MouseEvent | React.TouchEvent, isVerticalRuler: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    
    // const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const clientPosition = 'touches' in e 
      ? isVerticalRuler ? e.touches[0].clientY : e.touches[0].clientX
      : isVerticalRuler ? (e as React.MouseEvent).clientY : (e as React.MouseEvent).clientX

    // Calculate position relative to the ruler's edge
    // For vertical ruler (left), subtract top ruler height (50px)
    // For horizontal ruler (top), subtract left ruler width (50px)
    const position = isVerticalRuler
      ? clientPosition - 50 // Subtract top ruler height
      : clientPosition - 50 // Subtract left ruler width

    onCreateLine(isVerticalRuler, position)
  }
  
  // Add a touch event handler to prevent default behavior
  const handleTouchEvent = (e: React.TouchEvent, isVerticalRuler: boolean) => {
    e.preventDefault(); // Prevent default touch behavior
    handleCreateLine(e, isVerticalRuler);
  }

  const handleClick = (e: React.MouseEvent, isVerticalRuler: boolean) => {
    // Only handle mouse clicks, not touch events that trigger click
    if (e.type === 'click' && e.nativeEvent instanceof MouseEvent) {
      handleCreateLine(e, isVerticalRuler);
    }
  };

  return (
    <div className="ruler">
      <div 
        className="horizontal-ruler"
        onClick={(e) => handleClick(e, false)}
        onTouchStart={(e) => handleTouchEvent(e, false)}
        onTouchMove={(e) => e.preventDefault()} // Prevent pull-to-refresh
      >
        {Array.from({ length: horizontalLength * 10 + 1 }).map((_, index) => {
          const isCm = index % 10 === 0
          const isMm5 = index % 5 === 0
          
          return (
            <div
              key={index}
              className={`tick ${isCm ? 'cm' : isMm5 ? 'mm5' : 'mm'}`}
              style={{
                left: `${(index * pixelsPerCm) / 10}px`
              }}
            >
              {isCm && <span className="label">{index / 10}</span>}
            </div>
          )
        })}
      </div>
      
      <div 
        className="vertical-ruler"
        onClick={(e) => handleClick(e, true)}
        onTouchStart={(e) => handleTouchEvent(e, true)}
        onTouchMove={(e) => e.preventDefault()} // Prevent pull-to-refresh
      >
        {Array.from({ length: verticalLength * 10 + 1 }).map((_, index) => {
          const isCm = index % 10 === 0
          const isMm5 = index % 5 === 0
          
          return (
            <div
              key={index}
              className={`tick ${isCm ? 'cm' : isMm5 ? 'mm5' : 'mm'}`}
              style={{
                top: `${(index * pixelsPerCm) / 10}px`
              }}
            >
              {isCm && <span className="label">{index / 10}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Ruler 