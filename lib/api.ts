import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Image generation API service
 */
export class ImageGenerationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZHIPUAI_API_KEY || '';
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(prompt: string, options: {
    imageSize?: string;
    batchSize?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
    negativePrompt?: string;
    seed?: number;
  } = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'cogview-3-flash',
          prompt,
          size: options.imageSize || '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        images: response.data.data.map((item: any) => ({
          url: item.url
        })),
        created: response.data.created,
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }
}

/**
 * Video generation API service
 */
export class VideoGenerationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZHIPUAI_API_KEY || '';
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
    if (!this.apiKey) {
      console.warn('ZHIPUAI_API_KEY is not set. Video generation will fail.');
    }
  }

  /**
   * Generate video from image and prompt
   */
  async generateVideo(imageUrl: string, prompt: string, options: {
    quality?: string;
    withAudio?: boolean;
    size?: string;
    fps?: number;
    isBase64?: boolean;
  } = {}) {
    try {
      console.log('VideoGenerationService.generateVideo called with:', {
        imageType: options.isBase64 ? 'base64' : 'url',
        prompt,
        options
      });

      if (!this.apiKey) {
        throw new Error('ZHIPUAI_API_KEY is not set');
      }

      const requestBody = {
        model: 'cogvideox-flash',
        prompt,
        image_url: imageUrl, // API accepts both URL and base64 data
        with_audio: options.withAudio || false,
      };
      
      console.log('Sending request to ZhipuAI API:', {
        url: `${this.baseUrl}/videos/generations`,
        body: {
          ...requestBody,
          image_url: options.isBase64 ? 'base64_data_truncated' : imageUrl.substring(0, 50) + '...'
        }
      });

      const response = await axios.post(
        `${this.baseUrl}/videos/generations`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('ZhipuAI API response status:', response.status);
      console.log('ZhipuAI API response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('Video generation error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  /**
   * Get video generation result
   */
  async getVideoResult(id: string) {
    try {
      console.log('VideoGenerationService.getVideoResult called with id:', id);
      
      if (!this.apiKey) {
        throw new Error('ZHIPUAI_API_KEY is not set');
      }

      console.log('Sending request to ZhipuAI API:', {
        url: `${this.baseUrl}/async-result/${id}`
      });

      const response = await axios.get(
        `${this.baseUrl}/async-result/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log('ZhipuAI API response status:', response.status);
      console.log('ZhipuAI API response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('Get video result error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }
}

/**
 * File storage service for saving generated content locally
 */
export class FileStorageService {
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), 'public', 'generated');
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      console.log(`Creating storage directory: ${this.storageDir}`);
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Download and save image from URL
   */
  async saveImage(imageUrl: string, filename: string): Promise<string> {
    try {
      console.log(`Downloading image from: ${imageUrl.substring(0, 50)}...`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      console.log(`Image downloaded, size: ${response.data.length} bytes`);
      
      const filePath = path.join(this.storageDir, filename);
      console.log(`Saving image to: ${filePath}`);
      fs.writeFileSync(filePath, response.data);
      
      const publicPath = `/generated/${filename}`;
      console.log(`Image saved, public path: ${publicPath}`);
      return publicPath;
    } catch (error) {
      console.error('Save image error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
      throw error;
    }
  }

  /**
   * Download and save video from URL
   */
  async saveVideo(videoUrl: string, filename: string): Promise<string> {
    try {
      console.log(`Downloading video from: ${videoUrl.substring(0, 50)}...`);
      const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      console.log(`Video downloaded, size: ${response.data.length} bytes`);
      
      const filePath = path.join(this.storageDir, filename);
      console.log(`Saving video to: ${filePath}`);
      fs.writeFileSync(filePath, response.data);
      
      const publicPath = `/generated/${filename}`;
      console.log(`Video saved, public path: ${publicPath}`);
      return publicPath;
    } catch (error) {
      console.error('Save video error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
      throw error;
    }
  }

  /**
   * Get all generated files
   */
  getGeneratedFiles() {
    try {
      const files = fs.readdirSync(this.storageDir);
      return files.map(filename => ({
        filename,
        path: `/generated/${filename}`,
        type: filename.endsWith('.mp4') ? 'video' : 'image',
        createdAt: fs.statSync(path.join(this.storageDir, filename)).birthtime,
      }));
    } catch (error) {
      console.error('Get generated files error:', error);
      return [];
    }
  }
} 