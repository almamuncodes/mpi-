"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Sliders, Sparkles } from "lucide-react";

const FILTERS = [
  { id: "none", label: "Normal", filter: "none" },
  { id: "vivid", label: "Vivid", filter: "brightness(1.12) contrast(1.1) saturate(1.2)" },
  { id: "contrast", label: "Contrast", filter: "contrast(1.3) saturate(1.15)" },
  { id: "vintage", label: "Vintage", filter: "sepia(0.35) contrast(1.1) saturate(1.1)" },
  { id: "bw", label: "B&W", filter: "grayscale(1) contrast(1.15)" },
];

export default function ImageCropModal({ imageSrc, onApply, onCancel, cropShape = "circle" }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [imgElement, setImgElement] = useState(null);
  const [isOriginalSize, setIsOriginalSize] = useState(false);

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImgElement(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Draw image on preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;

    const ctx = canvas.getContext("2d");
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);

    ctx.save();

    // Draw background grid
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, size, size);

    // Apply Filter
    const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter);
    ctx.filter = activeFilterObj ? activeFilterObj.filter : "none";

    // Calculate dimensions
    let scale;
    if (isOriginalSize) {
      scale = Math.min(size / imgElement.width, size / imgElement.height) * zoom;
    } else {
      scale = Math.max(size / imgElement.width, size / imgElement.height) * zoom;
    }

    const drawW = imgElement.width * scale;
    const drawH = imgElement.height * scale;

    const x = (size - drawW) / 2 + offset.x;
    const y = (size - drawH) / 2 + offset.y;

    ctx.drawImage(imgElement, x, y, drawW, drawH);
    ctx.restore();

    // Draw mask overlay if not original mode
    if (!isOriginalSize) {
      ctx.save();
      ctx.fillStyle = "rgba(9, 9, 11, 0.65)";
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      const margin = 14;
      const rectSize = size - margin * 2;

      if (cropShape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2 - margin, 0, Math.PI * 2, true);
      } else {
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(margin, margin, rectSize, rectSize, 16);
        } else {
          ctx.rect(margin, margin, rectSize, rectSize);
        }
      }
      ctx.fill("evenodd");

      // Draw border guide
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#3b82f6";
      ctx.beginPath();
      if (cropShape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2 - margin, 0, Math.PI * 2);
      } else {
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(margin, margin, rectSize, rectSize, 16);
        } else {
          ctx.rect(margin, margin, rectSize, rectSize);
        }
      }
      ctx.stroke();
      ctx.restore();
    } else {
      // Guide border for full original size
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#3b82f6";
      ctx.strokeRect(x, y, drawW, drawH);
      ctx.restore();
    }
  }, [imgElement, zoom, offset, selectedFilter, cropShape, isOriginalSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse & Touch Pan Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedFilter("none");
  };

  // Generate lightweight compressed Blob
  const handleApply = () => {
    if (!imgElement) return;

    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");

    if (isOriginalSize) {
      const maxDim = 500;
      const aspect = imgElement.width / imgElement.height;
      let exportW, exportH;
      if (imgElement.width >= imgElement.height) {
        exportW = Math.min(imgElement.width, maxDim);
        exportH = exportW / aspect;
      } else {
        exportH = Math.min(imgElement.height, maxDim);
        exportW = exportH * aspect;
      }
      exportCanvas.width = exportW;
      exportCanvas.height = exportH;

      const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter);
      ctx.filter = activeFilterObj ? activeFilterObj.filter : "none";
      ctx.drawImage(imgElement, 0, 0, exportW, exportH);
    } else {
      exportCanvas.width = 300;
      exportCanvas.height = 300;

      const size = 300;
      const scale = Math.max(size / imgElement.width, size / imgElement.height) * zoom;
      const drawW = imgElement.width * scale;
      const drawH = imgElement.height * scale;

      const x = (size - drawW) / 2 + (offset.x * (300 / 300));
      const y = (size - drawH) / 2 + (offset.y * (300 / 300));

      const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter);
      ctx.filter = activeFilterObj ? activeFilterObj.filter : "none";

      ctx.drawImage(imgElement, x, y, drawW, drawH);
    }

    // Dynamic compression algorithm targeting 30-40 KB
    const compressToTargetSize = (q = 0.72) => {
      exportCanvas.toBlob(
        (blob) => {
          if (!blob) return;
          const sizeKb = blob.size / 1024;
          
          // If size exceeds 40KB and quality can be reduced further, step down quality
          if (sizeKb > 40 && q > 0.35) {
            compressToTargetSize(Math.max(0.35, q - 0.08));
          } else {
            console.log(`[Image Optimizer] Compressed output image: ${sizeKb.toFixed(1)} KB (Quality: ${(q * 100).toFixed(0)}%)`);
            const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
            const previewUrl = URL.createObjectURL(blob);
            onApply({ file, previewUrl });
          }
        },
        "image/jpeg",
        q
      );
    };

    compressToTargetSize(0.72);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Edit Photo</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl mb-4 border border-zinc-800">
          <button
            type="button"
            onClick={() => { setIsOriginalSize(false); setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              !isOriginalSize ? "bg-blue-500 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Crop Mode
          </button>
          <button
            type="button"
            onClick={() => { setIsOriginalSize(true); setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isOriginalSize ? "bg-blue-500 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Original Full Size
          </button>
        </div>

        {/* Canvas Preview Area */}
        <div
          className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner select-none touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-950/70 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-zinc-300 pointer-events-none font-mono">
            Drag to pan • Slider to zoom
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="w-full mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1"><ZoomOut size={14} /> Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom & Pan"
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-blue-400 transition cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Filter Selection Pills */}
        <div className="w-full mt-5">
          <p className="text-xs text-zinc-400 font-medium mb-2 flex items-center gap-1">
            <Sliders size={14} /> Preset Filters
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedFilter === f.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={18} /> Apply & Save
          </button>
        </div>

      </div>
    </div>
  );
}
