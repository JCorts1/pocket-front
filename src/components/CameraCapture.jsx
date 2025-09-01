import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

const CameraCapture = ({ onImageCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use file upload instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        setCapturedImage({
          file,
          url: URL.createObjectURL(blob)
        });
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCapturedImage({
        file,
        url: URL.createObjectURL(file)
      });
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      onImageCapture(capturedImage.file);
      cleanup();
    }
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    startCamera();
  };

  const cleanup = () => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    onClose();
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage.url);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={cleanup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Capture Receipt</h3>

        {!stream && !capturedImage && (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Camera size={20} />
              {isLoading ? 'Starting Camera...' : 'Open Camera'}
            </button>

            <div className="text-center text-gray-500">or</div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600"
            >
              <Upload size={20} />
              Upload from Gallery
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {stream && !capturedImage && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 border-2 border-white opacity-50 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white"></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage.url}
                alt="Captured receipt"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={confirmImage}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600"
              >
                <Check size={20} />
                Use This Photo
              </button>
              <button
                onClick={retakePhoto}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;