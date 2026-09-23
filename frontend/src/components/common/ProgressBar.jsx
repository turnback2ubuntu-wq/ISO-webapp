import React from 'react';

export default function ProgressBar({ value = 0, colorScheme = 'auto', height = 8 }) {
  const percentage = Math.min(100, Math.max(0, value));

  let finalColor = 'blue';
  if (colorScheme === 'auto') {
    if (percentage >= 90) finalColor = 'green';
    else if (percentage >= 60) finalColor = 'blue';
    else finalColor = 'amber';
  } else {
    finalColor = colorScheme;
  }

  return (
    <div className="progress-bar-track" style={{ height: `${height}px` }}>
      <div
        className={`progress-bar-fill ${finalColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
