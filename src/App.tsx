import { useState, useCallback, useEffect } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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

  const toggleFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement && 
          !(document as any).webkitFullscreenElement && 
          !(document as any).mozFullScreenElement &&
          !(document as any).msFullscreenElement) {
        // Request fullscreen with fallbacks
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen with fallbacks
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }, []);

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
        >
          Calibrate
        </button>
        <button 
          className="toggle-fullscreen-button"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button className="reset-button" onClick={handleReset}>Reset</button>
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