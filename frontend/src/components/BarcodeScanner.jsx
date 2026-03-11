import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import {
  Camera,
  X,
  ScanBarcode,
  Shield,
  CheckCircle2,
  Info,
  Keyboard,
  RefreshCw,
  Loader2,
} from "lucide-react";

const BarcodeScanner = ({ onScanComplete, onClose }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scanStatus, setScanStatus] = useState("scanning"); // scanning, success, looking_up
  const [hasCamera, setHasCamera] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lookupError, setLookupError] = useState(null);

  // Look up food by barcode using OpenFoodFacts API
  const lookupBarcode = async (barcode) => {
    try {
      setScanStatus("looking_up");
      setIsLookingUp(true);
      
      console.log("Looking up barcode:", barcode);
      
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.status === 1 && response.data.product) {
        const product = response.data.product;
        // Try multiple fields for product name
        const foodName = 
          product.product_name || 
          product.product_name_en || 
          product.product_name_original ||
          product.generic_name ||
          product.generic_name_en ||
          barcode;
        
        console.log("Found food:", foodName);
        return foodName;
      }
      
      // Try alternative - search by barcode in URL
      console.log("Product not found, trying alternative API...");
      
      // Try UPC Item DB as fallback
      try {
        const altResponse = await axios.get(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
        );
        
        if (altResponse.data.items && altResponse.data.items.length > 0) {
          const item = altResponse.data.items[0];
          const altName = item.title || item.description || barcode;
          console.log("Found in alt API:", altName);
          return altName;
        }
      } catch (altError) {
        console.log("Alt API failed:", altError.message);
      }
      
      // Return with message if not found
      return `${barcode} (Not found in database)`;
    } catch (error) {
      console.error("Error looking up barcode:", error);
      return `${barcode} (Lookup failed)`;
    } finally {
      setIsLookingUp(false);
    }
  };

  useEffect(() => {
    if (!scanning || manualEntry) return;

    const startScanner = async () => {
      try {
        // Check for cameras first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");

        if (cameras.length === 0) {
          setHasCamera(false);
          setIsInitializing(false);
          return;
        }

        setHasCamera(true);
        setIsInitializing(false);

        // Create scanner instance
        const html5QrCode = new Html5Qrcode("barcode-scanner");
        scannerRef.current = html5QrCode;

        // Start scanning
        await html5QrCode.start(
          { facingMode: "environment" }, // Use rear camera on mobile
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          async (decodedText) => {
            // Barcode detected - look up food name
            setScanStatus("looking_up");
            html5QrCode.stop();
            
            const foodName = await lookupBarcode(decodedText);
            setScanStatus("success");
            
            setTimeout(() => {
              onScanComplete(foodName);
            }, 500);
          },
          () => {} // Ignore scan errors
        );
      } catch (err) {
        console.error("Camera error:", err);
        setHasCamera(false);
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning, manualEntry, onScanComplete]);

  const handleClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    onClose();
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      setIsLookingUp(true);
      setLookupError(null);
      const foodName = await lookupBarcode(barcodeInput.trim());
      setIsLookingUp(false);
      // If lookup returned an error message, show it
      if (foodName.includes("Not found") || foodName.includes("failed")) {
        setLookupError("Product not found in database. You can edit the name manually.");
      }
      onScanComplete(foodName);
    }
  };

  const retryCamera = () => {
    setHasCamera(null);
    setIsInitializing(true);
    setScanning(true);
    setScanStatus("scanning");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-6 pb-16">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ScanBarcode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Scan Barcode
                </h3>
                <p className="text-emerald-100 text-sm">
                  {manualEntry
                    ? "Enter barcode to look up food"
                    : "Scan to auto-lookup food name"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Scanner / Manual Entry Section */}
        {!manualEntry ? (
          <div className="relative mx-4 -mt-12 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Looking up barcode - show loading */}
            {scanStatus === "looking_up" || isLookingUp ? (
              <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Looking up food...
                </p>
              </div>
            ) : hasCamera === null ? (
              // Checking for camera
              <div className="w-full aspect-[4/3] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-200 rounded-full">
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Checking camera access...</p>
              </div>
            ) : hasCamera ? (
              // Camera found - show scanner
              <>
                {scanStatus === "success" && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/20">
                    <div className="p-4 bg-emerald-500 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                    </div>
                  </div>
                )}
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
                    <Camera className="w-10 h-10 text-emerald-500 animate-pulse" />
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Starting camera...
                    </p>
                  </div>
                )}
                <div 
                  id="barcode-scanner" 
                  className="w-full aspect-[4/3] bg-black"
                  style={{ 
                    minHeight: '250px',
                    position: 'relative',
                    overflow: 'hidden'
                  }} 
                />
              </>
            ) : (
              // No camera - show fallback
              <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-center p-6">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">
                  No Camera Available
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  This device doesn't have a camera or it's blocked.
                </p>
                <button
                  onClick={retryCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-4 -mt-12 bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barcode Number (UPC/EAN)
                </label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="012345678901"
                  disabled={isLookingUp}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the barcode number from the product
                </p>
                {lookupError && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ {lookupError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!barcodeInput.trim() || isLookingUp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-xl font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Look Up & Add Food"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pb-4">
          {!manualEntry && (
            <>
              {/* Device Support Info */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">How it works</p>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 space-y-1">
                    <p>📷 Scan barcode → Auto-lookup food name</p>
                    <p>📱 Mobile: Use rear camera</p>
                    <p>💻 Laptop: Need webcam</p>
                  </div>
                </div>
              </div>

              {/* Manual Entry Button */}
              {manualEntry ? (
                <button
                  onClick={() => {
                    setManualEntry(false);
                    retryCamera();
                  }}
                  disabled={isLookingUp}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Try camera scanning
                </button>
              ) : (
                <button
                  onClick={() => setManualEntry(true)}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter barcode manually
                </button>
              )}
            </>
          )}
        </div>

        {/* Privacy */}
        <div className="px-6 pb-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Your data stays private
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;