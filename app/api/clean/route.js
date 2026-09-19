import fs from 'fs';
import path from 'path';

export async function GET() {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    return Response.json({ cleared: true });
  }
  return Response.json({ cleared: false });
}
