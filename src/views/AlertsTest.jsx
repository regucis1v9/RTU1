// AlertsTest.js
import React from 'react';
import Notiflix from 'notiflix';
import "../styles/overviewStyles.scss"; // Custom styles

const AlertsTest = () => {
  // Alert functions
  const showAlert = (type, message) => {
    // Customize Notiflix alerts based on the type
    switch (type) {
      case "error":
        Notiflix.Report.failure("Kļūda", message, "Labi", {
          svgSize: '60px',
          backgroundColor: '#f8d7da',
          messageColor: '#721c24',
          titleColor: '#721c24',
          buttonBackground: '#721c24',
        });
        break;
      case "warning":
        Notiflix.Report.warning("Brīdinājums", message, "Labi", {
          svgSize: '60px',
          backgroundColor: '#fff3cd',
          messageColor: '#856404',
          titleColor: '#856404',
          buttonBackground: '#856404',
        });
        break;
      case "info":
        Notiflix.Report.info("Apstiprinājums", message, "Labi", {
          svgSize: '60px',
          backgroundColor: '#d1ecf1',
          messageColor: '#0c5460',
          titleColor: '#0c5460',
          buttonBackground: '#0c5460',
        });
        break;
      case "confirm":
        Notiflix.Confirm.show(
          'Apstiprinājums',
          message,
          'Jā',
          'Nē',
          () => {
            console.log('Jā izvēlēts!');
            // Add your "Yes" action here
          },
          () => {
            console.log('Nē izvēlēts!');
            // Add your "No" action here
          },
          {
            svgSize: '60px',
            backgroundColor: '#d1ecf1',
            messageColor: '#0c5460',
            titleColor: '#0c5460',
            buttonBackground: '#0c5460',
            cancelButtonBackground: '#721c24',
            okButtonBackground: '#28a745',
            okButtonColor: '#fff',
            cancelButtonColor: '#fff',
          }
        );
        break;
      default:
        Notiflix.Report.info("Info", message, "Labi");
    }
  };

  return (
    <div>
      <h2>Alert Testing for Dry Freezing Machine</h2>
      <div className="alert-buttons">
        <button className="alert-button" onClick={() => showAlert("error", "Mašīna nav pievienota!")}>
          Mašīna nav pievienota
        </button>
        <button className="alert-button" onClick={() => showAlert("warning", "Liela temperatūras maiņa!")}>
          Liela temperatūras maiņa
        </button>
        <button className="alert-button" onClick={() => showAlert("warning", "Liela spiediena maiņa!")}>
          Liela spiediena maiņa
        </button>
        <button className="alert-button" onClick={() => showAlert("confirm", "Vai tiešām vēlaties turpināt?")}>
          Apstiprināt darbību
        </button>
      </div>
    </div>
  );
};

export default AlertsTest;
