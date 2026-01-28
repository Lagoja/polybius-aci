import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BLOB_URL = 'https://iube3munpbzbmeja.public.blob.vercel-storage.com/results.json';

export async function GET() {
  try {
    const response = await fetch(BLOB_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Log the actual status for debugging
      console.error('Blob fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'No published results yet', status: response.status },
        { status: 404 }
      );
    }

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
