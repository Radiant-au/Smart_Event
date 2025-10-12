import React from 'react';
import Barcode from 'react-barcode';
import { renderToString } from 'react-dom/server';

export const generateBarcodeDataURL = (code: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    canvas.width = 400;
    canvas.height = 150;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barcodeElement = renderToString(
      React.createElement(Barcode, { value: code, format: 'CODE128', width: 2, height: 100 })
    );

    const img = new Image();
    const svgBlob = new Blob([barcodeElement], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 50, 25);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.src = url;
  });
};
