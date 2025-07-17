'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Upload } from 'lucide-react';

interface VideoGeneratorProps {
  generatedImage: string | null;
  onBack: () => void;
}

/**
 * Video Generator Component
 */
export default function VideoGenerator({ generatedImage, onBack }: VideoGeneratorProps) {
  const [videoPrompt, setVideoPrompt] = useState('');
  const [withAudio, setWithAudio] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showPromptError, setShowPromptError] = useState(false);
  const [imageToUse, setImageToUse] = useState<string | null>(generatedImage || null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Set image to use when generatedImage prop changes
  useEffect(() => {
    if (generatedImage) {
      setImageToUse(generatedImage);
    }
  }, [generatedImage]);

  /**
   * Helper function to determine which image is currently active
   */
  const getActiveImage = (): { type: 'generated' | 'uploaded' | null, data: string | File | null } => {
    if (imageToUse === generatedImage && generatedImage) {
      return { type: 'generated', data: generatedImage };
    } else if (uploadedImage && uploadedImageUrl) {
      return { type: 'uploaded', data: uploadedImage };
    }
    return { type: null, data: null };
  };

  /**
   * Handle image upload
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setVideoError('Please upload an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setVideoError('Image size should be less than 5MB');
      return;
    }
    
    // Clear previous uploaded image URL if exists
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    
    setUploadedImage(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedImageUrl(objectUrl);
    setImageToUse(null); // Clear generated image selection to indicate we're using the uploaded image
    setVideoError(null);
  };

  /**
   * Convert file to base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Process PayPal payment for video generation
   */
  const processPayment = async () => {
    // Clear previous error states
    setShowPromptError(false);
    setVideoError(null);
    
    if (!videoPrompt.trim()) {
      setVideoError('Please enter an animation prompt');
      setShowPromptError(true);
      return;
    }

    const activeImage = getActiveImage();
    if (!activeImage.data) {
      setVideoError('Please select or upload an image');
      return;
    }
    
    try {
      // Clear previous generated video when starting a new payment process
      setGeneratedVideo(null);
      setIsCreatingPayment(true);
      setVideoError(null);
      
      // Prepare image data
      let imageData: string | null = null;
      let originalUrl = sessionStorage.getItem('originalImageUrl');
      let isBase64 = false;
      
      // If using generated image
      if (activeImage.type === 'generated') {
        imageData = activeImage.data as string;
        // We'll use the original URL from session storage
      }
      // If using uploaded image, convert to base64
      else if (activeImage.type === 'uploaded') {
        setIsUploading(true);
        try {
          // Convert file to base64
          const base64Data = await fileToBase64(activeImage.data as File);
          imageData = base64Data;
          originalUrl = null; // No original URL for uploaded images
          isBase64 = true;
          setIsUploading(false);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          setVideoError('Failed to process the uploaded image');
          setIsCreatingPayment(false);
          setIsUploading(false);
          return;
        }
      }
      
      // Create PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        // Store video prompt and settings in session storage before redirecting
        sessionStorage.setItem('videoPrompt', videoPrompt);
        sessionStorage.setItem('withAudio', String(withAudio));
        sessionStorage.setItem('imageUrl', imageData || '');
        sessionStorage.setItem('isBase64', String(isBase64));
        if (originalUrl) {
          sessionStorage.setItem('originalUrl', originalUrl);
        }
        
        // Open PayPal payment in a new window
        window.open(data.approvalUrl, '_blank');
        setIsCreatingPayment(false);
      } else {
        setVideoError('Failed to create payment. Please try again.');
        setIsCreatingPayment(false);
      }
    } catch (e) {
      setVideoError('Payment processing error. Please try again.');
      setIsCreatingPayment(false);
      setIsUploading(false);
    }
  };

  // Check for payment status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');
    
    if (paymentStatus === 'success' && orderId) {
      // Payment was successful, generate the video
      generateVideo(orderId);
    } else if (paymentStatus === 'failed') {
      const reason = urlParams.get('reason') || 'unknown';
      setVideoError(`Payment failed: ${reason}`);
    }
    
    // Clean URL parameters
    if (paymentStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /**
   * Generate video after successful payment
   */
  const generateVideo = async (orderId: string) => {
    try {
      // Clear previous generated video when starting a new generation
      setGeneratedVideo(null);
      setIsGeneratingVideo(true);
      setVideoError(null);
      
      // Get stored video prompt and settings
      const storedVideoPrompt = sessionStorage.getItem('videoPrompt');
      const storedWithAudio = sessionStorage.getItem('withAudio') === 'true';
      const storedImageUrl = sessionStorage.getItem('imageUrl');
      const storedIsBase64 = sessionStorage.getItem('isBase64') === 'true';
      const storedOriginalUrl = sessionStorage.getItem('originalUrl');
      
      if (!storedImageUrl || !storedVideoPrompt) {
        setVideoError('Missing video generation parameters');
        setIsGeneratingVideo(false);
        return;
      }
      
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: storedImageUrl,
          originalUrl: storedOriginalUrl || undefined,
          isBase64: storedIsBase64,
          prompt: storedVideoPrompt,
          withAudio: storedWithAudio,
          orderId: orderId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Poll for video generation status
        pollVideoStatus(data.taskId);
      } else {
        setVideoError(data.error || 'Failed to start video generation');
        setIsGeneratingVideo(false);
      }
    } catch (e) {
      console.error('Video generation error:', e);
      setVideoError('Video generation error: ' + (e instanceof Error ? e.message : String(e)));
      setIsGeneratingVideo(false);
    }
  };

  /**
   * Poll for video generation status
   */
  const pollVideoStatus = async (taskId: string) => {
    try {
      console.log('Polling video status for taskId:', taskId);
      const response = await fetch(`/api/generate-video?taskId=${taskId}`);
      const data = await response.json();
      console.log('Poll response:', data);
      
      if (data.success) {
        if (data.taskStatus === 'SUCCESS') {
          // Video is ready
          console.log('Video generation successful, video URL:', data.videoUrl);
          setGeneratedVideo(data.videoUrl);
          setIsGeneratingVideo(false);
          // Clear session storage
          sessionStorage.removeItem('videoPrompt');
          sessionStorage.removeItem('withAudio');
          sessionStorage.removeItem('imageUrl');
        } else if (data.taskStatus === 'PROCESSING') {
          console.log('Video is still processing, polling again in 5 seconds');
          // Video is still being generated, poll again after 5 seconds
          setTimeout(() => pollVideoStatus(taskId), 5000);
        } else {
          console.error('Video generation failed with status:', data.taskStatus);
          setVideoError('Video generation failed');
          setIsGeneratingVideo(false);
        }
      } else {
        console.error('Failed to check video status:', data.error);
        setVideoError(data.error || 'Failed to check video status');
        setIsGeneratingVideo(false);
      }
    } catch (e) {
      console.error('Error checking video status:', e);
      setVideoError('Error checking video status: ' + (e instanceof Error ? e.message : String(e)));
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AI Video Generator</h2>
      
      {/* Image Selection Section - Always show this section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Image</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Option 1: Use Generated Image */}
          <div 
            className={`p-4 border rounded-md cursor-pointer ${
              imageToUse === generatedImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => {
              if (generatedImage) {
                setImageToUse(generatedImage);
                setUploadedImage(null);
                setUploadedImageUrl(null);
                if (uploadedImageUrl) {
                  URL.revokeObjectURL(uploadedImageUrl);
                }
              }
            }}
          >
            <div className="flex flex-col items-center">
              {generatedImage ? (
                <>
                  <div className="relative w-full">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className={`w-full h-40 object-contain mb-2 ${imageToUse !== generatedImage ? 'opacity-70' : ''}`}
                    />
                    {imageToUse === generatedImage && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="text-sm font-medium">Use Generated Image</p>
                    {imageToUse === generatedImage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToUse(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <p>No generated image available</p>
                  <p className="text-xs mt-1">Generate an image first</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Option 2: Upload Own Image */}
          <div 
            className={`p-4 border rounded-md cursor-pointer ${
              uploadedImageUrl && imageToUse !== generatedImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => {
              if (uploadedImageUrl) {
                setImageToUse(null); // Explicitly set imageToUse to null to indicate we're using uploaded image
              }
            }}
          >
            <div className="flex flex-col items-center">
              {uploadedImageUrl ? (
                <>
                  <div className="relative w-full">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded" 
                      className="w-full h-40 object-contain mb-2" 
                    />
                    {imageToUse !== generatedImage && uploadedImage && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="text-sm font-medium">Uploaded Image</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                        setUploadedImageUrl(null);
                        URL.revokeObjectURL(uploadedImageUrl);
                        // If this was the selected image, clear selection
                        if (imageToUse !== generatedImage) {
                          setImageToUse(null);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Upload Your Own Image</p>
                  <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Image Selection Status */}
        <div className="text-sm mt-2">
          {getActiveImage().type === 'generated' && (
            <p className="text-blue-600">Using generated image for video creation</p>
          )}
          {getActiveImage().type === 'uploaded' && (
            <p className="text-blue-600">Using uploaded image for video creation</p>
          )}
          {getActiveImage().type === null && (
            <p className="text-amber-600">No image selected. Please select or upload an image.</p>
          )}
        </div>
      </div>
      
      {/* Animation Prompt - Always show this section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Animation Prompt
        </label>
        <textarea
          value={videoPrompt}
          onChange={(e) => {
            setVideoPrompt(e.target.value);
            if (showPromptError && e.target.value.trim()) {
              setShowPromptError(false);
            }
          }}
          placeholder="Describe how you want the image to animate..."
          className={`w-full px-3 py-2 border rounded-md ${showPromptError ? 'border-red-500' : 'border-gray-300'}`}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Example: "Zoom in slowly on the character's face" or "Make the water ripple gently"
        </p>
        
        {showPromptError && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            Please enter an animation prompt
          </div>
        )}
      </div>
      
      {/* Audio Option - Always show this section */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={withAudio}
            onChange={(e) => setWithAudio(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Generate AI Audio</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Add AI-generated audio to match your video
        </p>
      </div>
      
      {/* Payment Notice - Always show this section */}
      <div className="bg-yellow-50 p-4 rounded-md mb-4 border border-yellow-200">
        <p className="text-sm font-medium">
          Video generation is a premium feature
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Your image will be transformed into a beautiful animated video using AI for just $0.8 per video.
        </p>
      </div>
      
      {/* Error Display */}
      {videoError && !showPromptError && (
        <div className="text-red-600 text-sm p-2 mb-4 bg-red-50 border border-red-200 rounded-md">
          {videoError}
        </div>
      )}
      
      {/* Action Buttons - Always show these buttons */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
        >
          Back
        </button>
        
        <button 
          onClick={processPayment}
          className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md"
          disabled={isCreatingPayment || isUploading || getActiveImage().type === null || !videoPrompt.trim()}
        >
          {isCreatingPayment || isUploading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              {isUploading ? 'Uploading...' : 'Processing...'}
            </span>
          ) : (
            'Generate Video ($0.8)'
          )}
        </button>
      </div>
      
      {/* Video Generation Progress */}
      {isGeneratingVideo && (
        <div className="p-6 border border-gray-200 rounded-md bg-gray-50 mb-6">
          <h3 className="text-xl font-semibold mb-4">Generating Your Video</h3>
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-700">This may take a minute or two...</p>
          </div>
        </div>
      )}

      {/* Generated Video Result */}
      {generatedVideo && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Generated Video</h3>
          <video 
            src={generatedVideo} 
            controls
            autoPlay
            loop
            className="w-full mb-4 border border-gray-200 rounded-md"
          />
          
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = generatedVideo;
              link.download = `generated_video_${Date.now()}.mp4`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  );
} 