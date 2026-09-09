import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string; // The 6-character code
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180 }) => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200 inline-flex flex-col items-center">
      <QRCodeSVG
        value={`guardianx://pair?code=${value}`}
        size={size}
        level="H"
        includeMargin={true}
        fgColor="#0f172a"
        bgColor="#ffffff"
      />
      <div className="mt-2 text-center">
        <span className="text-xs font-bold text-slate-600 tracking-wider">SCAN TO PAIR</span>
      </div>
    </div>
  );
};
