import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Scan, CheckCircle, XCircle } from "lucide-react";
import Barcode from "react-barcode";
import { validateTicket } from "@/api/ticket-api";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const Scanner = () => {
  const location = useLocation();
  const userId = (location as any)?.state?.userId as
    | string
    | number
    | undefined;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    barcode?: string;
  } | null>(null);
  const [mode, setMode] = useState<"manual" | "camera">("manual");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performValidation = async (code: string) => {
    if (!code.trim()) return;
    if (!userId) {
      setScanResult({
        valid: false,
        message: "User not set. Please open Scanner from Dashboard.",
        barcode: code.trim(),
      });
      return;
    }
    try {
      const res = await validateTicket({
        code: code.trim(),
        userId: String(userId ?? ""),
      });
      const payload = (res as any).data;
      const success = payload?.success ?? true;
      const message = payload?.data?.message ?? payload?.message ?? "Scanned";
      setScanResult({ valid: !!success, message, barcode: code.trim() });
    } catch (err: any) {
      setScanResult({
        valid: false,
        message: err?.response?.data?.message,
        barcode: code.trim(),
      });
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcodeInput.trim()) {
      return;
    }
    await performValidation(barcodeInput.trim());

    setBarcodeInput("");
    inputRef.current?.focus();
  };

  const resetScan = () => {
    setScanResult(null);
    setBarcodeInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (mode !== "camera") {
      // Cleanup if leaving camera mode
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      return;
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: 350,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
    } as any;

    const onSuccess = async (decodedText: string) => {
      await performValidation(decodedText);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      setMode("manual");
      inputRef.current?.focus();
    };

    const onError = (_: any) => {};

    html5QrCode
      .start({ facingMode: "environment" }, config, onSuccess, onError)
      .catch((err) => {
        setScanResult({
          valid: false,
          message:
            "Cannot access camera. Please allow camera permission or use manual mode.",
          barcode: undefined,
        });
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
    };
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl">
              <Scan className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Card Scanner</h1>
          <p className="text-muted-foreground">
            Scan or enter card barcodes to validate entry
          </p>
        </div>

        {mode === "manual" ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan Ticket</CardTitle>
              <CardDescription>
                Enter the barcode code below to validate a
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScan} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode Code</Label>
                  <Input
                    id="barcode"
                    placeholder="e.g., EVT1234-VIP-0001"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    ref={inputRef}
                    autoFocus
                    className="font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full">
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Card
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("camera")}
                  >
                    Scan by Camera
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan by Camera</CardTitle>
              <CardDescription>
                Use your webcam to scan a barcode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="qr-reader" className="w-full" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("manual")}
                >
                  Back to Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {scanResult && (
          <Card
            className={
              scanResult.valid
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
            }
          >
            <CardContent className="pt-6">
              <Alert
                variant={scanResult.valid ? "default" : "destructive"}
                className="mb-4"
              >
                {scanResult.valid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle className="text-lg">
                  {scanResult.valid ? "Valid Ticket" : "Invalid Ticket"}
                </AlertTitle>
                <AlertDescription className="text-base">
                  {scanResult.message}
                </AlertDescription>
              </Alert>

              {scanResult.barcode && scanResult.valid && (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <Barcode
                    value={scanResult.barcode}
                    format="CODE128"
                    width={2}
                    height={100}
                  />
                </div>
              )}

              <Button onClick={resetScan} variant="outline" className="w-full">
                Scan Another Card
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Enter or paste the ticket barcode in the input field above</p>
            <p>2. Click "Scan Ticket" to validate the ticket</p>
            <p>3. The system will check if the ticket is valid and unused</p>
            <p>4. Valid tickets will be automatically marked as used</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scanner;
