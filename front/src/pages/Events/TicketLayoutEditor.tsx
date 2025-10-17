import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Transformer,
} from "react-konva";
import { Upload } from "lucide-react";
import Konva from "konva";
import { uploadBatchImage, ticketDesignInfoDto } from "@/api/batch-api";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
type DesignMode = "static" | "dynamic";

interface PlaceholderBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TicketLayoutDesigner: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<DesignMode>("static");
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const batchId = useParams().batchId;

  const [barcodeBox, setBarcodeBox] = useState<PlaceholderBox>({
    x: 50,
    y: 400,
    width: 300,
    height: 80,
  });

  const [qrBox, setQrBox] = useState<PlaceholderBox>({
    x: 400,
    y: 400,
    width: 100,
    height: 100,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const barcodeRef = useRef<Konva.Rect>(null);
  const qrRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transformerRef.current) {
      const selectedNode =
        selectedId === "barcode"
          ? barcodeRef.current
          : selectedId === "qr"
          ? qrRef.current
          : null;

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        setCanvasSize({ width, height });
        setUploadedImage(img);
        setImageUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBarcodeTransform = () => {
    const node = barcodeRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      setBarcodeBox({
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY),
      });
    }
  };

  const handleQrTransform = () => {
    const node = qrRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      setQrBox({
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY),
      });
    }
  };

  const handleSaveLayout = async () => {
    if (!uploadedImage || !imageUrl) {
      alert("Please upload an image first");
      return;
    }

    setIsLoading(true);
    try {
      // Convert image URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ticket-design.png", { type: "image/png" });

      // Prepare the design data
      const designData: ticketDesignInfoDto = {
        mode: mode,
        barcodeWidth: barcodeBox.width.toString(),
        barcodeHeight: barcodeBox.height.toString(),
        barcodeX: barcodeBox.x.toString(),
        barcodeY: barcodeBox.y.toString(),
        qrWidth: mode === "dynamic" ? qrBox.width.toString() : "0",
        qrHeight: mode === "dynamic" ? qrBox.height.toString() : "0",
        qrX: mode === "dynamic" ? qrBox.x.toString() : "0",
        qrY: mode === "dynamic" ? qrBox.y.toString() : "0",
      };

      // Call the API
      const response2 = await uploadBatchImage(
        Number(batchId),
        file,
        designData
      );

      // Create download link for the blob response
      const url = window.URL.createObjectURL(new Blob([response2.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `batch-${batchId}-tickets.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("Tickets generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating tickets:", error);
      alert("Error generating tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      return;
    }

    const clickedOnTransformer =
      e.target.getParent().className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    const name = e.target.name();
    setSelectedId(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Ticket Layout Designer
            </h1>
            <p className="text-slate-600">
              Upload your ticket design and position barcode/QR placeholders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="ticket-upload"
                    />
                    <label htmlFor="ticket-upload" className="cursor-pointer">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-lg font-medium text-slate-700 mb-2">
                        Upload Ticket Design
                      </p>
                      <p className="text-sm text-slate-500">
                        PNG or JPG (Max 800x500)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                    <Stage
                      width={canvasSize.width}
                      height={canvasSize.height}
                      onClick={handleStageClick}
                      onTap={handleStageClick}
                      className="mx-auto"
                    >
                      <Layer>
                        <KonvaImage
                          image={uploadedImage}
                          width={canvasSize.width}
                          height={canvasSize.height}
                        />

                        <Rect
                          ref={barcodeRef}
                          name="barcode"
                          x={barcodeBox.x}
                          y={barcodeBox.y}
                          width={barcodeBox.width}
                          height={barcodeBox.height}
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          draggable
                          onDragEnd={handleBarcodeTransform}
                          onTransformEnd={handleBarcodeTransform}
                          onClick={() => setSelectedId("barcode")}
                          onTap={() => setSelectedId("barcode")}
                        />

                        {mode === "dynamic" && (
                          <Rect
                            ref={qrRef}
                            name="qr"
                            x={qrBox.x}
                            y={qrBox.y}
                            width={qrBox.width}
                            height={qrBox.height}
                            fill="rgba(16, 185, 129, 0.3)"
                            stroke="#10b981"
                            strokeWidth={3}
                            draggable
                            onDragEnd={handleQrTransform}
                            onTransformEnd={handleQrTransform}
                            onClick={() => setSelectedId("qr")}
                            onTap={() => setSelectedId("qr")}
                          />
                        )}

                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 50) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      </Layer>
                    </Stage>
                  </div>
                )}

                {uploadedImage && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Image
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Design Mode
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode("static")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      mode === "static"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                    }`}
                  >
                    Static
                  </button>
                  <button
                    onClick={() => setMode("dynamic")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      mode === "dynamic"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                    }`}
                  >
                    Dynamic
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  {mode === "static"
                    ? "Single barcode placeholder"
                    : "Barcode + QR code placeholders"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Coordinates
                </h2>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <h3 className="font-semibold text-slate-800">Barcode</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">X:</span>
                        <span className="ml-2 font-mono text-slate-800">
                          {barcodeBox.x}px
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Y:</span>
                        <span className="ml-2 font-mono text-slate-800">
                          {barcodeBox.y}px
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">W:</span>
                        <span className="ml-2 font-mono text-slate-800">
                          {barcodeBox.width}px
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">H:</span>
                        <span className="ml-2 font-mono text-slate-800">
                          {barcodeBox.height}px
                        </span>
                      </div>
                    </div>
                  </div>

                  {mode === "dynamic" && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <h3 className="font-semibold text-slate-800">
                          QR Code
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">X:</span>
                          <span className="ml-2 font-mono text-slate-800">
                            {qrBox.x}px
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Y:</span>
                          <span className="ml-2 font-mono text-slate-800">
                            {qrBox.y}px
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">W:</span>
                          <span className="ml-2 font-mono text-slate-800">
                            {qrBox.width}px
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">H:</span>
                          <span className="ml-2 font-mono text-slate-800">
                            {qrBox.height}px
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveLayout}
                disabled={!uploadedImage || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
              >
                {isLoading ? "Generating..." : "Save & Download"}
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Upload your ticket design image</li>
              <li>
                2. Choose Static (barcode only) or Dynamic (barcode + QR) mode
              </li>
              <li>
                3. Drag and resize the colored placeholder boxes to position
                them
              </li>
              <li>4. Click "Save Layout" to output the coordinate data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketLayoutDesigner;
