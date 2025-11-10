import React from 'react';
import './PeriodCard.css';

const PeriodCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  onClick,
  subtitle 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('tr-TR');
    }
    return val;
  };

  return (
    <div className={`period-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="period-card-header">
        <span className="period-card-title">{title}</span>
        {subtitle && <span className="period-card-subtitle">{subtitle}</span>}
      </div>
      <div className="period-card-content">
        <div className="period-card-value">{formatValue(value)}</div>
        {change !== undefined && change !== null && (
          <div className={`period-card-change ${changeType}`}>
            {changeType === 'positive' ? '+' : '-'} {Math.abs(change)}%
          </div>
        )}
      </div>
      {onClick && (
        <div className="period-card-hint">
          ** Rakamlara tıklandığında ilgili tablo açılacak.
        </div>
      )}
    </div>
  );
};

export default PeriodCard;

