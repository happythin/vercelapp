import React, { useState } from 'react';
import './Accordion.css';

const Accordion = ({ title, defaultOpen = false, children, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-container">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title-section">
          {icon && <span className="accordion-icon">{icon}</span>}
          <h3 className="accordion-title">{title}</h3>
        </div>
        <div className="accordion-toggle">
          <span className="accordion-toggle-text">{isOpen ? 'kapat' : 'aç'}</span>
          <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;

