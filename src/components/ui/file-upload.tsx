"use client"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Upload, X, File, Image, Loader2 } from "lucide-react"
import imageCompression from "browser-image-compression"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize?: number // in MB
  type: 'resume' | 'avatar'
  currentFile?: string
  onDelete?: () => void
  loading?: boolean
}

export function FileUpload({ 
  onFileSelect, 
  accept, 
  maxSize = 5, 
  type, 
  currentFile, 
  onDelete,
  loading = false 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setCompressing(false)
    
    // Validate file type first
    if (type === 'resume' && file.type !== 'application/pdf') {
      setError('Resume must be a PDF file')
      return
    }

    if (type === 'avatar' && !file.type.startsWith('image/')) {
      setError('Avatar must be an image file')
      return
    }

    // For resumes, use original file
    if (type === 'resume') {
      // Validate file size for resumes
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Resume must be smaller than ${maxSize}MB`)
        return
      }
      onFileSelect(file)
      return
    }

    // For avatar images, try to compress the image
    if (type === 'avatar') {
      setCompressing(true)
      
      // First check if file is already small enough (under 2MB)
      if (file.size <= 2 * 1024 * 1024) {
        console.log('File is already small enough, using original')
        setCompressing(false)
        onFileSelect(file)
        return
      }
      
      try {
        console.log('Starting image compression for file:', file.name, 'Size:', file.size, 'Type:', file.type)
        
        const options = {
          maxSizeMB: 1, // Target 1MB
          maxWidthOrHeight: 1024, // Max 1024px
          useWebWorker: false, // Disable web worker to avoid issues
          fileType: 'image/jpeg',
          initialQuality: 0.8,
        }
        
        const compressedFile = await imageCompression(file, options)
        console.log('Compression successful. Original:', file.size, 'Compressed:', compressedFile.size)
        
        setCompressing(false)
        onFileSelect(compressedFile)
      } catch (error) {
        console.error('Image compression failed:', error)
        
        // Fallback: use original file if it's under 5MB
        if (file.size <= 5 * 1024 * 1024) {
          console.log('Using original file as fallback (under 5MB)')
          setCompressing(false)
          onFileSelect(file)
        } else {
          setCompressing(false)
          setError('Image is too large. Please try a smaller image (under 5MB) or use a different file format.')
        }
      }
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = () => {
    if (type === 'resume') {
      return <File className="h-8 w-8 text-gray-400" />
    }
    return <Image className="h-8 w-8 text-gray-400" />
  }

  const getFileTypeText = () => {
    if (type === 'resume') {
      return 'PDF'
    }
    return 'Image'
  }

  return (
    <div className="space-y-4">
      {currentFile ? (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {type === 'resume' ? 'Resume' : 'Image'} uploaded
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-cardinal bg-cardinal/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="text-center">
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">
                Upload {type === 'resume' ? 'Resume' : 'Image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {type === 'resume' 
                  ? 'PDF files up to 5MB'
                  : 'Any image file (auto-compressed)'
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="mt-3"
              disabled={loading || compressing}
            >
              {loading || compressing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {compressing ? 'Compressing...' : 'Choose File'}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              or drag and drop
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  )
}
