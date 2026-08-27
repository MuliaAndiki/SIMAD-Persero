import React from 'react';

export function LandingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      {/* Top-right blob */}
      <svg
        className="absolute -top-32 -right-32 w-[600px] h-[600px] text-primary/5"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.4,-0.9C86.7,14.5,80.8,29,71.8,41.3C62.8,53.6,50.7,63.7,37.1,71.1C23.5,78.5,8.3,83.2,-6.3,83.1C-20.9,83,-34.9,78.1,-47.4,70.1C-59.9,62.1,-70.9,51,-77.2,37.7C-83.5,24.4,-85.1,9,-81.8,-4.7C-78.5,-18.4,-70.3,-31.4,-59.8,-41.3C-49.3,-51.2,-36.5,-58,-23.8,-65.6C-11.1,-73.2,1.5,-81.6,15.1,-80.6C28.7,-79.6,30.5,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Bottom-left blob */}
      <svg
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] text-primary/5"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M39.9,-65.7C54.5,-60.2,70.5,-53.7,79.2,-42.1C87.9,-30.5,89.3,-13.8,87.1,2.3C84.9,18.4,79.1,33.8,70.1,47C61.1,60.2,49,71.2,35,77.8C21,84.4,5.1,86.6,-10.2,84.3C-25.5,82,-40.2,75.2,-52.1,65.5C-64,55.8,-73.1,43.2,-78.7,28.9C-84.3,14.6,-86.4,-1.4,-83.1,-16.2C-79.8,-31,-71.1,-44.6,-59.2,-53.7C-47.3,-62.8,-32.2,-67.4,-17.8,-72.4C-3.4,-77.4,10.3,-82.8,22.6,-79.4C34.9,-76,25.3,-71.2,39.9,-65.7Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Grid pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
