"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from './button'
import { X, Check } from 'lucide-react'

interface AvatarCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  loading?: boolean
}

export function AvatarCropper({ imageSrc, onCropComplete, onCancel, loading = false }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback((_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size to 200x200 for profile picture
      canvas.width = 200
      canvas.height = 200

      // Create circular clipping path
      ctx.save()
      ctx.beginPath()
      ctx.arc(100, 100, 100, 0, 2 * Math.PI)
      ctx.clip()

      // Load the original image
      const image = new Image()
      image.crossOrigin = 'anonymous'
      
      image.onload = () => {
        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          200,
          200
        )

        ctx.restore()

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob)
          }
        }, 'image/jpeg', 0.9)
      }

      image.src = imageSrc
    } catch (error) {
      console.error('Error creating cropped image:', error)
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Position Your Profile Picture</h3>
        <p className="text-sm text-gray-600">Drag to move, scroll to zoom</p>
      </div>
      
      <div className="flex justify-center">
        {/* Cropper */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="relative w-80 h-80 mx-auto">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                },
              }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Drag to move • Scroll to zoom
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="cardinal"
          onClick={createCroppedImage}
          disabled={loading}
        >
          <Check className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Profile Picture'}
        </Button>
      </div>
    </div>
  )
}
