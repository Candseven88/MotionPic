'use client';

import Image from 'next/image';
import ImageGenerator from '@/components/ImageGenerator';

// 顶部卡片图片列表（如需更换图片，将新图片放入 public/generated/，并修改下方路径即可）
const topImages = [
  '/generated/image_1751111949119.png',
  '/generated/image_1751114352177.png',
  '/generated/image_1751114781595.png',
  '/generated/image_1751115138002.png',
  '/generated/image_1751115443458.png',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fff8f0] flex flex-col">
      {/* 顶部橙色提示条 */}
      <div className="w-full bg-[#ff7e36] text-white text-center text-xs py-1">
        Current AI image generation peak, generation may be slightly delayed, please be patient <span className="ml-1">✨</span>
      </div>
      {/* Header + 顶部图片卡片展示 */}
      <header className="relative flex flex-col items-center pt-8 pb-4">
        {/* logo */}
        <div className="absolute left-6 top-4 flex items-center select-none">
          <span className="font-extrabold text-lg text-[#22223b] tracking-tight">Motion<span className="text-[#ff7e36]">Pic</span></span>
        </div>
        {/* Top card images (replace in public/generated/ and topImages array) */}
        <div className="flex gap-2 md:gap-4 mb-6 mt-2 relative z-10">
          {topImages.map((src, i) => (
            <div
              key={src}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl shadow-lg overflow-hidden border-4 border-white"
              style={{
                transform: `rotate(${[-8, -3, 0, 5, 10][i]}deg) translateY(${[8, 0, -10, 0, 8][i]}px)`
              }}
            >
              <Image src={src} alt="AI style sample" width={128} height={128} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#22223b] leading-tight mb-2">
          Bring Your Ideas <span className="text-[#ff7e36]">to Life</span> with AI Image & Animation
        </h1>
        {/* Subtitle */}
        <p className="text-base md:text-lg text-center text-[#4a3b22] max-w-2xl mx-auto mb-4">
          Instantly generate logos, posters, story illustrations, ads, and more with AI. Turn static images into stunning animations—let your creativity move!
        </p>
      </header>

      {/* Main Content: Upload Form, Features, FAQ, Showcase */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4">
          {/* Upload Form Section */}
          <section className="flex justify-center">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-orange-100 p-6 md:p-8 mb-12 mt-4">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-[#22223b]">Try AI Image & Animation Now</h2>
              <p className="text-sm text-center text-gray-500 mb-6">Upload an image or describe your idea. AI will generate high-quality visuals and animations for you. No design skills needed!</p>
              <ImageGenerator />
            </div>
          </section>

          {/* Key Features Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-[#22223b]">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#fff3e6] rounded-xl p-6 shadow border border-orange-100">
                <h3 className="font-semibold text-lg mb-2 text-[#ff7e36]">Instant AI Image Creation</h3>
                <p className="text-gray-700">Generate logos, posters, story art, ads, and more in seconds with advanced AI technology.</p>
              </div>
              <div className="bg-[#fff3e6] rounded-xl p-6 shadow border border-orange-100">
                <h3 className="font-semibold text-lg mb-2 text-[#ff7e36]">Animate Any Image</h3>
                <p className="text-gray-700">Turn static images into eye-catching animations and bring your ideas to life with a single click.</p>
              </div>
              <div className="bg-[#fff3e6] rounded-xl p-6 shadow border border-orange-100">
                <h3 className="font-semibold text-lg mb-2 text-[#ff7e36]">No Design Skills Needed</h3>
                <p className="text-gray-700">Simply upload or describe your idea. Our AI handles the rest—perfect for everyone!</p>
              </div>
              <div className="bg-[#fff3e6] rounded-xl p-6 shadow border border-orange-100">
                <h3 className="font-semibold text-lg mb-2 text-[#ff7e36]">High-Quality Results</h3>
                <p className="text-gray-700">Get professional-grade images and animations ready for social media, marketing, or storytelling.</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-[#22223b]">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <details className="bg-white rounded-lg shadow border border-orange-100 p-4 group" open>
                <summary className="font-semibold text-[#ff7e36] cursor-pointer outline-none group-open:underline">How does MotionPic work?</summary>
                <p className="text-gray-700 mt-2">Simply upload an image or enter a description. Our AI instantly generates high-quality visuals or animations based on your input.</p>
              </details>
              <details className="bg-white rounded-lg shadow border border-orange-100 p-4 group">
                <summary className="font-semibold text-[#ff7e36] cursor-pointer outline-none group-open:underline">What can I create with MotionPic?</summary>
                <p className="text-gray-700 mt-2">You can create logos, posters, story illustrations, ads, animated social posts, and more—let your imagination run wild!</p>
              </details>
              <details className="bg-white rounded-lg shadow border border-orange-100 p-4 group">
                <summary className="font-semibold text-[#ff7e36] cursor-pointer outline-none group-open:underline">Do I need any design experience?</summary>
                <p className="text-gray-700 mt-2">No! MotionPic is designed for everyone. Just upload or describe your idea and let AI do the magic.</p>
              </details>
              <details className="bg-white rounded-lg shadow border border-orange-100 p-4 group">
                <summary className="font-semibold text-[#ff7e36] cursor-pointer outline-none group-open:underline">How fast are the results?</summary>
                <p className="text-gray-700 mt-2">Most images and animations are generated within seconds, even during peak times.</p>
              </details>
              <details className="bg-white rounded-lg shadow border border-orange-100 p-4 group">
                <summary className="font-semibold text-[#ff7e36] cursor-pointer outline-none group-open:underline">Can I use the results commercially?</summary>
                <p className="text-gray-700 mt-2">Yes! All generated images and animations are yours to use for personal or commercial projects.</p>
              </details>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#eaf3fa] border-t border-gray-200 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} MotionPic. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 