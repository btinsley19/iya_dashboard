"use client"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Upload, X, File, Image, Loader2 } from "lucide-react"

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File must be smaller than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (type === 'resume' && file.type !== 'application/pdf') {
      setError('Resume must be a PDF file')
      return
    }

    if (type === 'avatar' && !file.type.startsWith('image/')) {
      setError('Avatar must be an image file')
      return
    }

    onFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
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
                  : 'Image files up to 2MB'
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="mt-3"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Choose File
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
