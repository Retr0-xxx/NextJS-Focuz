import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth"
import { getPlantData } from '@/utils/db';

// Helper: get metadata (duration, etc.) from video
async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      // In most cases, metadata.format.duration is a number in seconds
      const duration = metadata?.format?.duration;
      if (!duration || typeof duration !== 'number') {
        return reject(new Error('Cannot read duration from ffprobe metadata.'));
      }
      resolve(duration);
    });
  });
}

// Helper: generate a single screenshot at a specific time (in seconds)
async function generateScreenshot(
  videoPath: string,
  outputPath: string,
  timeInSeconds: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x?' // Adjust if you want a different resolution
      })
      .on('end', async () => {
        try {
          // Read file into a buffer
          const data = await promisify(fs.readFile)(outputPath);
          // Clean up the file after reading
          await promisify(fs.unlink)(outputPath);
          resolve(data);
        } catch (readErr) {
          reject(readErr);
        }
      })
      .on('error', (ffmpegErr) => {
        reject(ffmpegErr);
      });
  });
}

// The POST function in the App Router receives a standard Request object
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request });
    const email = session?.user?.email;
    const { growth } = await getPlantData(email);
    
    const pct = parseFloat(growth);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      // Return a standard Response with a 400 status
      return new Response(JSON.stringify({ error: 'Invalid percentage (0–100).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Path to the video (in /public folder)
    const videoPath = path.join(process.cwd(), 'public', 'video.mp4');

    // 4. Get video duration (in seconds)
    const duration = await getVideoDuration(videoPath);

    // 5. Calculate the snapshot time in seconds
    const timeInSeconds = (pct / 100) * duration;

    // 6. Prepare an output path for the screenshot (temporary file)
    const tempScreenshotPath = path.join(
      process.cwd(),
      '.next',
      `snapshot-${Date.now()}.jpg`
    );

    // 7. Generate the screenshot
    const imageBuffer = await generateScreenshot(
      videoPath,
      tempScreenshotPath,
      timeInSeconds
    );

    // 8. Return the Buffer as a JPEG image
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg'
      }
    });
  } catch (error) {
    console.error('Error generating snapshot:', error);

    // Return an error response
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
