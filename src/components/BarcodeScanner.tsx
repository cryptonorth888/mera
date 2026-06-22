'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const formats = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128',
  'code_39', 'code_93', 'codabar', 'itf', 'rss_14',
  'rss_expanded', 'data_bar', 'data_bar_expanded'
];

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 },
          // @ts-ignore
          formatsToSupport: formats },
        (decodedText) => {
          if (!stoppedRef.current) {
            stoppedRef.current = true;
            scanner.stop().finally(() => onScan(decodedText));
          }
        },
        () => {}
      )
      .then(() => setStarted(true))
      .catch((err) => {
        setError('Не удалось запустить камеру: ' + err.message);
      });

    return () => {
      stoppedRef.current = true;
      if (started && scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, started]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-black dark:text-white text-lg">Сканер штрихкода</h3>
          <button onClick={onClose} className="text-black dark:text-white text-xl">✕</button>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <div id="barcode-reader" className="w-full rounded-xl overflow-hidden" />
        )}

        <p className="text-xs text-gray-400 mt-3 text-center">
          Наведите камеру на штрихкод
        </p>
      </div>
    </div>
  );
}