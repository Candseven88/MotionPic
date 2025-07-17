import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  // 支持 ?dir=generated 查询 generated 子目录
  const { searchParams } = new URL(request.url);
  const dir = searchParams.get('dir') === 'generated' ? 'generated' : '';
  const dirPath = path.join(process.cwd(), 'public', dir);
  const files = fs.readdirSync(dirPath);
  // 只返回图片文件
  const images = files.filter(file =>
    /\.(png|jpe?g|gif|webp)$/i.test(file)
  );
  return NextResponse.json(images);
} 