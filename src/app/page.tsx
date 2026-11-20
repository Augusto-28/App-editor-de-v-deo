'use client';

import dynamic from 'next/dynamic';

const VideoEditor = dynamic(() => import('@/components/VideoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-editor-bg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Carregando editor...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <VideoEditor />;
}
