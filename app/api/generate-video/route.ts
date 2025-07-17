import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationService, FileStorageService } from '@/lib/api';
import { isWhitelisted, getClientIP } from '@/lib/whitelist';

/**
 * POST /api/generate-video
 * Generate video from image and prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, originalUrl, isBase64, prompt, withAudio, orderId } = body;
    
    console.log('Received video generation request:', { 
      imageUrl: imageUrl ? (isBase64 ? 'base64_image_data' : imageUrl.substring(0, 50) + '...') : null,
      originalUrl: originalUrl ? originalUrl.substring(0, 50) + '...' : null,
      isBase64: !!isBase64,
      prompt, 
      withAudio, 
      orderId 
    });

    if (!imageUrl || !prompt) {
      console.error('Missing required parameters:', { imageUrl: !!imageUrl, prompt: !!prompt });
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // Check if client is whitelisted for local development
    const clientIP = getClientIP(request);
    const isLocalWhitelisted = isWhitelisted(clientIP);
    console.log('Client IP check:', { clientIP, isLocalWhitelisted });

    // Verify that orderId is provided (payment verification) unless whitelisted
    if (!orderId && !isLocalWhitelisted) {
      console.error('Payment required but not provided');
      return NextResponse.json(
        { error: 'Payment required for video generation' },
        { status: 402 }
      );
    }

    // In a production environment, you would verify the payment status with PayPal here
    // by calling the PayPal API to check the order status

    const videoService = new VideoGenerationService();
    const storageService = new FileStorageService();

    // Determine the image URL to use for the API call
    let finalImageUrl = imageUrl;
    
    // If the image is base64 encoded, we can use it directly
    if (isBase64) {
      console.log('Using base64 encoded image data');
      // The API accepts base64 data directly, so we can use it as is
    }
    // If originalUrl is provided, use it instead
    else if (originalUrl) {
      console.log('Using provided original image URL');
      finalImageUrl = originalUrl;
    }
    // Otherwise, if the image URL is a local path (starts with /generated/)
    else if (imageUrl.startsWith('/generated/')) {
      // Try to get the original URL from our helper function
      const fetchedOriginalUrl = await getOriginalImageUrl(imageUrl);
      
      if (fetchedOriginalUrl) {
        console.log('Using fetched original image URL:', fetchedOriginalUrl);
        finalImageUrl = fetchedOriginalUrl;
      } else {
        console.error('Could not find original image URL for:', imageUrl);
        return NextResponse.json(
          { error: 'Could not process the image URL. For local images, please provide the original URL.' },
          { status: 400 }
        );
      }
    }

    // Generate video
    console.log('Calling video generation service with image data type:', isBase64 ? 'base64' : 'url');
    const result = await videoService.generateVideo(finalImageUrl, prompt, {
      withAudio: withAudio || false,
      isBase64: !!isBase64
    });
    console.log('Video generation service response:', result);

    return NextResponse.json({
      success: true,
      taskId: result.id,
      requestId: result.request_id,
      model: result.model,
      taskStatus: result.task_status,
    });
  } catch (error) {
    console.error('Video generation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate video: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get the original image URL for a local image path
 */
async function getOriginalImageUrl(localPath: string): Promise<string | null> {
  // This is a simple implementation. In a real app, you would look up the original URL in a database.
  // For now, we'll use the original URL from the ImageGenerator component that was stored in the session.
  
  // For testing, if we're in development mode, we can use a placeholder image URL
  if (process.env.NODE_ENV === 'development') {
    // Use a test image from a public URL
    return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000';
  }
  
  return null;
}

/**
 * GET /api/generate-video
 * Get video generation result
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    console.log('Checking video status for taskId:', taskId);

    if (!taskId) {
      console.error('Missing taskId in request');
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const videoService = new VideoGenerationService();
    const storageService = new FileStorageService();

    // Get video result
    console.log('Calling getVideoResult...');
    const result = await videoService.getVideoResult(taskId);
    console.log('Video result response:', result);

    if (result.task_status === 'SUCCESS' && result.video_result) {
      const videoUrl = result.video_result[0].url;
      const coverImageUrl = result.video_result[0].cover_image_url;
      const timestamp = Date.now();
      const videoFilename = `video_${timestamp}.mp4`;
      const coverFilename = `cover_${timestamp}.png`;

      console.log('Saving video and cover image...');
      // Save video and cover locally
      const localVideoPath = await storageService.saveVideo(videoUrl, videoFilename);
      const localCoverPath = await storageService.saveImage(coverImageUrl, coverFilename);
      console.log('Files saved:', { localVideoPath, localCoverPath });

      return NextResponse.json({
        success: true,
        videoUrl: localVideoPath,
        coverImageUrl: localCoverPath,
        originalVideoUrl: videoUrl,
        originalCoverUrl: coverImageUrl,
        taskStatus: result.task_status,
      });
    } else if (result.task_status === 'PROCESSING') {
      console.log('Video still processing');
      return NextResponse.json({
        success: true,
        taskStatus: result.task_status,
        message: 'Video is still being generated',
      });
    } else {
      console.error('Video generation failed with status:', result.task_status);
      return NextResponse.json({
        success: false,
        taskStatus: result.task_status,
        error: 'Video generation failed',
      });
    }
  } catch (error) {
    console.error('Get video result API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to get video result: ${errorMessage}` },
      { status: 500 }
    );
  }
} 