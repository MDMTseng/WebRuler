import { useState, useEffect } from 'react'
import './App.css'
import Ruler from './components/Ruler'
import CalibrationModal from './components/CalibrationModal'
import MeasurementLines from './components/MeasurementLines'

interface Line {
  id: string
  position: number
  isHorizontal: boolean
}

function App() {
  const [pixelsPerCm, setPixelsPerCm] = useState<number>(() => {
    const saved = localStorage.getItem('pixelsPerCm')
    return saved ? parseFloat(saved) : 37.795275591 // Default value (96 DPI)
  })
  const [showCalibration, setShowCalibration] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [showInstructions, setShowInstructions] = useState(true)
  const [showMeasurements, setShowMeasurements] = useState(true) // Default to true since panel will be minimizable

  const handleCalibration = (newPixelsPerCm: number) => {
    setPixelsPerCm(newPixelsPerCm)
    localStorage.setItem('pixelsPerCm', newPixelsPerCm.toString())
    // setShowCalibration(false)
  }

  const handleCreateLine = (isHorizontal: boolean, position: number) => {
    setLines(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        position,
        isHorizontal
      }
    ])
    setShowInstructions(false)
    setShowMeasurements(true) // Show measurements when creating first line
  }

  // Add meta viewport tag for better mobile support
  useEffect(() => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }, []);

  const handleReset = () => {
    setLines([]);
  };

  // Add this useEffect to prevent pull-to-refresh on mobile devices
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      // Prevent pull-to-refresh when interacting with the app
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    // Add the event listener to the document
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  return (
    <div className="app">
      <div className="top-buttons">
        <button 
          className="calibrate-button"
          onClick={() => setShowCalibration(true)}
          title="Calibrate"
        />
        <button 
          className="reset-button" 
          onClick={handleReset}
          title="Reset"
        />
      </div>
      
      {showInstructions && (
        <div className="measurement-instructions">
          <div className="instruction-box">
            <h3>How to Use:</h3>
            <ol>
              <li>Double-click on the top ruler to create vertical lines</li>
              <li>Double-click on the left ruler to create horizontal lines</li>
              <li>Drag lines to measure distances</li>
              <li>Use the minimize button to hide/show measurements panel</li>
            </ol>
          </div>
        </div>
      )}

      <Ruler 
        pixelsPerCm={pixelsPerCm} 
        onCreateLine={handleCreateLine}
      />
      <MeasurementLines 
        pixelsPerCm={pixelsPerCm}
        lines={lines}
        onLinesChange={setLines}
        showMeasurements={showMeasurements}
        onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
      />
      
      {showCalibration && (
        <CalibrationModal 
          onCalibrate={handleCalibration}
          onClose={() => setShowCalibration(false)}
          currentPixelsPerCm={pixelsPerCm}
        />
      )}
    </div>
  )
}

export default App 