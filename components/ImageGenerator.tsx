'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, Heart, Coffee } from 'lucide-react';
import VideoGenerator from './VideoGenerator';

/**
 * Image Generator Component
 */
export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [isLocalDevelopment, setIsLocalDevelopment] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Check if running in local development
  useEffect(() => {
    // Check if we're running on localhost
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsLocalDevelopment(isLocal);
  }, []);

  // Show donation popup after image generation
  useEffect(() => {
    if (generatedImage) {
      // Show donation popup after a short delay
      const timer = setTimeout(() => {
        setShowDonationPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [generatedImage]);

  /**
   * Generate image from prompt
   */
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageSize, quality: 'standard' }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setOriginalImageUrl(data.originalUrl);
        // Store the original URL in session storage for later use
        sessionStorage.setItem('originalImageUrl', data.originalUrl);
        setIsGenerating(false);
      } else {
        setError(data.error || 'Failed to generate image');
        setIsGenerating(false);
      }
    } catch (e) {
      setError('Network error');
      setIsGenerating(false);
    }
  };

  /**
   * Open donation modal
   */
  const openDonation = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDonationModal(true);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'image'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('image')}
        >
          Image Generator
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'video'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('video')}
        >
          Video Generator
        </button>
      </div>

      {/* Image Generator Tab */}
      {activeTab === 'image' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">AI Image Generator</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Size
            </label>
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="1024x1024">1024x1024 (Square)</option>
              <option value="768x1344">768x1344 (Portrait)</option>
              <option value="1344x768">1344x768 (Landscape)</option>
              <option value="1152x864">1152x864 (Landscape)</option>
              <option value="864x1152">864x1152 (Portrait)</option>
            </select>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </span>
              ) : (
                'Generate Image'
              )}
            </button>
            
            <button
              onClick={openDonation}
              className="flex-1 bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
            >
              Support Us
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 mb-4">
              {error}
            </div>
          )}

          {generatedImage && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Your Generated Image</h3>
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="w-full mb-4 border border-gray-200 rounded-md"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = `generated_image_${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  Download Image
                </button>
                
                <button
                  onClick={() => setActiveTab('video')}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md"
                >
                  Create Video
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Generator Tab */}
      {activeTab === 'video' && (
        <VideoGenerator 
          generatedImage={generatedImage} 
          onBack={() => setActiveTab('image')}
        />
      )}

      {/* Donation popup */}
      {showDonationPopup && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Enjoying MotionPic?</h4>
            <button 
              onClick={() => setShowDonationPopup(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            If you find this tool useful, please consider supporting our work!
          </p>
          <button
            onClick={openDonation}
            className="w-full bg-amber-500 text-white text-sm py-2 px-3 rounded-md hover:bg-amber-600 transition-colors"
          >
            Support Us
          </button>
        </div>
      )}

      {/* Custom Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Support MotionPic</h3>
              <button 
                onClick={() => setShowDonationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-amber-100 p-4 rounded-full mb-4">
                  <Coffee size={48} className="text-amber-600" />
                </div>
                <h4 className="text-xl font-bold mb-2">Buy us a coffee</h4>
                <p className="text-gray-600 text-center mb-4">
                  Your support helps keep MotionPic running and enables us to develop new features!
                </p>
                <div className="text-2xl font-bold text-amber-600 mb-4">NZ$1</div>
              </div>
              
              <a 
                href="https://candseven4.gumroad.com/l/upnxna" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-amber-500 text-white text-center py-3 px-4 rounded-md hover:bg-amber-600 transition-colors"
              >
                <span className="flex items-center justify-center">
                  <Heart size={18} className="mr-2" /> I want this!
                </span>
              </a>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                You'll be redirected to Gumroad's secure payment page in a new tab.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add TypeScript declaration for Gumroad
declare global {
  interface Window {
    GumroadOverlay: {
      show: (productUrl: string, options?: { overlayPage?: boolean }) => void;
    };
  }
} 