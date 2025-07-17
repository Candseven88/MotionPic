import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationService, FileStorageService } from '@/lib/api';

/**
 * POST /api/generate-image
 * Generate image from text prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageSize } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const imageService = new ImageGenerationService();
    const storageService = new FileStorageService();

    // Generate image
    const result = await imageService.generateImage(prompt, {
      imageSize,
    });

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      const timestamp = Date.now();
      const filename = `image_${timestamp}.png`;
      // Save image locally
      const localPath = await storageService.saveImage(imageUrl, filename);

      return NextResponse.json({
        success: true,
        imageUrl: localPath,
        originalUrl: imageUrl,
        created: result.created,
      });
    } else {
      return NextResponse.json({ error: 'No images generated' }, { status: 500 });
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}