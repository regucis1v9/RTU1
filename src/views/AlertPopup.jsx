import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Minimize2, Maximize2, X, Move } from 'lucide-react';

export const AlertPopup = ({ alerts = [], onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const dragRef = useRef(null);

  // Alert type color mapping with more nuanced gradients
  const alertTypeColors = {
    warning: {
      background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
      textColor: 'white',
      shadowColor: 'rgba(255, 152, 0, 0.5)'
    },
    critical: {
      background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
      textColor: 'white',
      shadowColor: 'rgba(244, 67, 54, 0.5)'
    },
    info: {
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      textColor: 'white',
      shadowColor: 'rgba(33, 150, 243, 0.5)'
    },
    default: {
      background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
      textColor: 'white',
      shadowColor: 'rgba(156, 39, 176, 0.5)'
    }
  };

  // Drag event handlers
  const handleMouseDown = (e) => {
    if (!isFullScreen) {
      setIsDragging(true);
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isFullScreen) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Existing navigation handlers remain the same
  const nextAlert = () => {
    setCurrentAlertIndex((prevIndex) => 
      (prevIndex + 1) % alerts.length
    );
  };

  const prevAlert = () => {
    setCurrentAlertIndex((prevIndex) => 
      prevIndex === 0 ? alerts.length - 1 : prevIndex - 1
    );
  };

  const toggleScreenMode = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCloseCurrentAlert = async () => {
    const currentAlert = alerts[currentAlertIndex]; // Get the current alert based on the index
    const fileName = currentAlert?.fileName; // Ensure the alert has a 'fileName' field
    
    if (!fileName) {
      console.error("Alert fileName is missing!");
      return; // Exit if no alert fileName is found
    }
  
    try {
      // Send a DELETE request to the backend to delete the corresponding alert file
      const response = await fetch(`http://localhost:5001/api/delete-alert`, {
        method: 'POST',  // Assuming POST as the filename is passed in the body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: fileName }), // Send fileName in the request body
      });
  
      if (response.ok) {
        console.log('Alert CSV file deleted successfully');
        // Perform additional actions if needed after successful deletion
        onClose(currentAlertIndex); // Close the alert after successful deletion
      } else {
        console.error('Failed to delete the file');
      }
    } catch (error) {
      console.error('Error during file deletion:', error);
    }
  };

  const handleCloseRequest = () => {
    setShowConfirm(true); // Show the confirmation dialog
  };

  const confirmClose = async () => {
    setShowConfirm(false);
    handleCloseCurrentAlert();
  };

  const cancelClose = () => {
    setShowConfirm(false); // Cancel closing
  };

  const currentAlert = alerts[currentAlertIndex];

  // Memoized styles with enhanced design
  const styles = useMemo(() => {
    const getAlertTypeStyle = () => {
      const type = currentAlert?.type?.toLowerCase() || 'default';
      return alertTypeColors[type] || alertTypeColors.default;
    };

    const alertStyle = getAlertTypeStyle();

    return {
      fullScreenOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '40px',
        boxSizing: 'border-box'
      },
      minimizedSidebar: {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: '400px',
        background: alertStyle.background,
        color: alertStyle.textColor,
        borderRadius: '20px',
        padding: '20px',
        zIndex: 1000,
        boxShadow: `0 15px 30px ${alertStyle.shadowColor}`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'transform 0.2s ease',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      },
      alertContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
      },
      fullScreenContent: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '800px',
        minWidth: '350px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        position: 'relative',
        background: alertStyle.background,
        color: alertStyle.textColor,
      },
      controlHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        minWidth: '90%',
      },
      controlButton: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        color: 'white',
      },
      navigationButton: {
        background: 'rgba(0,0,0,0.3)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        color: 'white',
      },
      confirmOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(8px)', // Glassmorphism effect
        animation: 'fadeIn 0.3s ease-in-out',
      },
      // Fullscreen confirm box
      confirmBoxFullScreen: {
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '30px 20px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        maxWidth: '400px',
        width: '90%',
        animation: 'scaleUp 0.3s ease-in-out',
        color: '#ffffff',
      },
      // Minimized confirm box
      confirmBoxMinimized: {
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '20px 15px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        maxWidth: '400px',
        width: '100%',
        color: '#ffffff',
      },
      confirmHeader: {
        fontSize: '1.8rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0,0,0,0.4)', 
      },
      confirmText: {
        fontSize: '1rem',
        marginBottom: '25px',
        lineHeight: 1.6,
        color: 'rgba(255, 255, 255, 0.85)',
      },
      confirmButton: {
        margin: '10px',
        padding: '12px 30px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease-in-out',
        textTransform: 'uppercase',
      },
      confirmYes: {
        background: 'linear-gradient(135deg, #ff4a4a, #ff6161)',
        color: '#ffffff',
        boxShadow: '0 5px 15px rgba(255, 97, 97, 0.5)',
        '&:hover': {
          background: 'linear-gradient(135deg, #ff6161, #ff4a4a)',
          transform: 'translateY(-2px) scale(1.05)',
        },
      },
      confirmNo: {
        background: 'linear-gradient(135deg, #4caf50, #66bb6a)', 
        color: '#ffffff',
        boxShadow: '0 5px 15px rgba(102, 187, 106, 0.5)',
        '&:hover': {
          background: 'linear-gradient(135deg, #66bb6a, #4caf50)',
          transform: 'translateY(-2px) scale(1.05)',
        },
      },
      alertContent: {
        padding: isFullScreen ? '0 40px' : '0',
      },
      alertHeader: {
        fontSize: isFullScreen ? '2rem' : '1.2rem',
        marginBottom: '15px',
        fontWeight: 'bold',
      },
      alertDetails: {
        fontSize: isFullScreen ? '1.5rem' : '1rem',
        lineHeight: 1.5,
      },
      dragHandle: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        cursor: 'move',
        color: 'rgba(255,255,255,0.7)',
        transition: 'color 0.3s ease',
      }
    };
  }, [isFullScreen, currentAlert, position, isDragging]);

  if (!currentAlert || !currentAlert.alerts || currentAlert.alerts.length === 0) return null;


  return (
    <div 
      style={isFullScreen ? styles.fullScreenOverlay : styles.minimizedSidebar}
      ref={dragRef}
      onMouseDown={handleMouseDown}
    >
      <div style={styles.alertContainer}>
        <div style={isFullScreen ? styles.fullScreenContent : {}}>
          <div style={{ ...styles.controlHeader, minWidth: '280px' }}>
            <button 
              onClick={toggleScreenMode} 
              style={styles.controlButton}
            >
              {isFullScreen ? <Minimize2 /> : <Maximize2 />}
            </button>
            <button 
              onClick={handleCloseRequest} 
              style={styles.controlButton}
            >
              <X />
            </button>
          </div>
  
          {alerts.length > 1 && !isFullScreen && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '10px',
              color: 'white' 
            }}>
              Alert {currentAlertIndex + 1} of {alerts.length}
            </div>
          )}
  
          {alerts.length > 1 && isFullScreen && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              padding: '0 20px'
            }}>
              <button 
                onClick={prevAlert} 
                style={styles.navigationButton}
              >
                <ChevronLeft size={30} />
              </button>
              <button 
                onClick={nextAlert} 
                style={styles.navigationButton}
              >
                <ChevronRight size={30} />
              </button>
            </div>
          )}
  
          <div style={styles.alertContent}>
            <h2 style={styles.alertHeader}>{currentAlert?.alerts[0]?.type}</h2>  
            <p style={styles.alertDetails}>{currentAlert?.alerts[0]?.message}</p>  
            <p style={styles.alertTime}>
              {currentAlert?.alerts[0]?.time}
            </p>
          </div>
  
          {alerts.length > 1 && !isFullScreen && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '10px' 
            }}>
              {alerts.map((_, index) => (
                <div 
                  key={index} 
                  style={{
                    width: '10px', 
                    height: '10px', 
                    margin: '0 5px', 
                    backgroundColor: currentAlertIndex === index ? 'white' : 'rgba(255,255,255,0.6)', 
                    borderRadius: '50%', 
                    cursor: 'pointer'
                  }} 
                  onClick={() => setCurrentAlertIndex(index)} 
                />
              ))}
            </div>
          )}
        </div>
  
        {showConfirm && (
          <div style={styles.confirmOverlay}>
            <div style={isFullScreen ? styles.confirmBoxFullScreen : styles.confirmBoxMinimized}>
              <h3 style={styles.confirmHeader}>Are you sure?</h3>
              <p style={styles.confirmText}>
                Do you want to delete this alert?
              </p>
              <div>
                <button
                  style={{ ...styles.confirmButton, ...styles.confirmYes }}
                  onClick={confirmClose}
                >
                  Yes, delete
                </button>
                <button
                  style={{ ...styles.confirmButton, ...styles.confirmNo }}
                  onClick={cancelClose}
                >
                  No, keep it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
