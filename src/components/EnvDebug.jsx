// src/components/EnvDebug.jsx
import React from 'react';

export default function EnvDebug() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  // Log to console for debugging
  console.log('🔧 Environment Debug:', {
    mode: isDev ? 'Development' : isProd ? 'Production' : 'Unknown',
    supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
    supabaseKey: supabaseKey ? 'Present' : 'Missing',
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : null,
    keyPreview: supabaseKey ? supabaseKey.substring(0, 20) + '...' : null
  });
  
  // Only show in development
  if (!isDev) return null;
  
  return (
    <div className="fixed top-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs max-w-sm z-50">
      <div className="font-semibold text-yellow-800 mb-2">🔧 Environment Debug</div>
      <div className="space-y-1 text-yellow-700">
        <div>Mode: {isDev ? 'Development' : isProd ? 'Production' : 'Unknown'}</div>
        <div>VITE_SUPABASE_URL: {supabaseUrl ? '✅ Present' : '❌ Missing'}</div>
        <div>VITE_SUPABASE_ANON_KEY: {supabaseKey ? '✅ Present' : '❌ Missing'}</div>
        {supabaseUrl && (
          <div className="text-xs text-yellow-600 truncate">
            URL: {supabaseUrl.substring(0, 30)}...
          </div>
        )}
        {supabaseKey && (
          <div className="text-xs text-yellow-600 truncate">
            Key: {supabaseKey.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
}
