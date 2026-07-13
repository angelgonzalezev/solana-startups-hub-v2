'use client';

import Image from 'next/image';
import { Crop, ImagePlus, Trash2, X } from 'lucide-react';
import React, { useEffect, useId, useRef, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import type { MediaMutation } from '@/interface/media';
import { resolveMediaUrl, validateMediaFile } from '@/services/mediaService';
import { createCroppedImage } from '@/utils/cropImage';

interface ImageUploaderProps {
  label: string;
  mutation: MediaMutation;
  onMutation: (mutation: MediaMutation) => void;
  value?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, mutation, onMutation, value }) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);

  useEffect(() => {
    if (mutation.type !== 'replace') {
      setReplacementPreview(null);
      return;
    }

    const preview = URL.createObjectURL(mutation.blob);
    setReplacementPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [mutation]);

  useEffect(
    () => () => {
      if (cropSource) URL.revokeObjectURL(cropSource);
    },
    [cropSource],
  );

  const preview = mutation.type === 'remove' ? undefined : replacementPreview || resolveMediaUrl(value);

  const closeCropper = () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    setError(null);
    setCropSource(URL.createObjectURL(file));
  };

  const confirmCrop = async () => {
    if (!cropSource || !croppedArea) return;

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await createCroppedImage(cropSource, croppedArea);
      if (blob.size > 2 * 1024 * 1024) throw new Error('Processed image must be 2 MB or smaller.');
      onMutation({ type: 'replace', blob });
      closeCropper();
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Unable to process the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="ml-1 text-sm font-medium text-white/60">
        {label}
      </label>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black sm:size-28">
          {preview ? (
            <Image src={preview} alt={`${label} preview`} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-white/20">
              <ImagePlus aria-hidden="true" className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="sr-only"
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-white-dark btn-sm gap-2">
            {preview ? (
              <Crop aria-hidden="true" className="size-4" />
            ) : (
              <ImagePlus aria-hidden="true" className="size-4" />
            )}
            {preview ? 'Replace image' : 'Choose image'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onMutation({ type: 'remove' });
              }}
              className="btn btn-white-dark btn-sm gap-2 border-red-500/20 text-red-400">
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      <p className="ml-1 text-xs text-white/35">JPG, PNG or WebP. Maximum 2 MB. Saved as a square image.</p>
      {error && <p className="ml-1 text-xs text-red-500">{error}</p>}

      {cropSource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Crop ${label.toLowerCase()}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[30px] border border-white/5 bg-[#0A0A0A] p-4 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Crop image</h3>
              <button
                type="button"
                onClick={closeCropper}
                className="flex size-10 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close cropper">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="relative aspect-square max-h-[55vh] w-full overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setCroppedArea(pixels)}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mt-5 space-y-2">
              <label htmlFor={`${inputId}-zoom`} className="text-sm font-medium text-white/60">
                Zoom
              </label>
              <input
                id={`${inputId}-zoom`}
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeCropper} className="btn btn-white-dark btn-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                disabled={isProcessing || !croppedArea}
                className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Use image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
