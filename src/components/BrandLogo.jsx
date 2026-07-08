import React from 'react';

const LOGO_URL = "https://base44.app/api/apps/6a2a0afc90f70c12878fb656/files/mp/public/6a2a0afc90f70c12878fb656/557bd1b19_classyq-logo.png";

export default function BrandLogo({ className = "", imgClassName = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="ClassyqBraidsLuxe"
        className={`object-contain ${imgClassName}`}
      />
    </div>
  );
}