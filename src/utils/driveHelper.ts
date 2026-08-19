export type VideoSourceType = 'drive_file' | 'drive_folder' | 'youtube' | 'vimeo' | 'direct' | 'unknown';

export interface ParsedVideoUrl {
  type: VideoSourceType;
  embedUrl: string;
  directUrl: string;
  id?: string;
  isFolder: boolean;
  isValid: boolean;
}

/**
 * Parses any video URL (Google Drive, YouTube, direct MP4, etc.)
 * and converts it into a workable iframe embed URL and direct launch URL.
 */
export function parseVideoUrl(rawUrl: string): ParsedVideoUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      type: 'unknown',
      embedUrl: '',
      directUrl: '',
      isFolder: false,
      isValid: false,
    };
  }

  const cleanUrl = rawUrl.trim();

  // 1. Google Drive Folder
  if (cleanUrl.includes('drive.google.com') && cleanUrl.includes('/folders/')) {
    const folderMatch = cleanUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = folderMatch ? folderMatch[1] : undefined;
    return {
      type: 'drive_folder',
      embedUrl: cleanUrl,
      directUrl: cleanUrl,
      id: folderId,
      isFolder: true,
      isValid: true,
    };
  }

  // 2. Google Drive File (file/d/ID/view or open?id=ID or uc?id=ID)
  if (cleanUrl.includes('drive.google.com')) {
    let fileId: string | null = null;

    const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    } else {
      const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        fileId = idParamMatch[1];
      }
    }

    if (fileId) {
      return {
        type: 'drive_file',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/view`,
        id: fileId,
        isFolder: false,
        isValid: true,
      };
    }
  }

  // 3. YouTube
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let ytId: string | null = null;
    if (cleanUrl.includes('youtu.be/')) {
      const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) ytId = match[1];
    } else if (cleanUrl.includes('youtube.com/watch')) {
      const match = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match) ytId = match[1];
    } else if (cleanUrl.includes('youtube.com/embed/')) {
      const match = cleanUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
      if (match) ytId = match[1];
    }

    if (ytId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
        directUrl: `https://www.youtube.com/watch?v=${ytId}`,
        id: ytId,
        isFolder: false,
        isValid: true,
      };
    }
  }

  // 4. Vimeo
  if (cleanUrl.includes('vimeo.com')) {
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        directUrl: cleanUrl,
        id: vimeoMatch[1],
        isFolder: false,
        isValid: true,
      };
    }
  }

  // 5. Direct Video File (.mp4, .webm, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl) || cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:video')) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      directUrl: cleanUrl,
      isFolder: false,
      isValid: true,
    };
  }

  // Generic fallback if URL has valid protocol
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return {
      type: 'unknown',
      embedUrl: cleanUrl,
      directUrl: cleanUrl,
      isFolder: false,
      isValid: true,
    };
  }

  return {
    type: 'unknown',
    embedUrl: '',
    directUrl: '',
    isFolder: false,
    isValid: false,
  };
}

/**
 * Batch parse lines of text representing choreographies, dancers, and drive URLs.
 * Example formats:
 * - "1. O Livro Encantado | Dancers: Maria, João | https://drive.google.com/file/d/123/view"
 * - "Castelo nas Nuvens - Ana, Thiago, Lucas - https://drive.google.com/..."
 */
export function parseBatchChoreographies(text: string): Array<{
  title: string;
  dancers: string[];
  driveUrl: string;
  act?: string;
  order?: number;
}> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results: Array<{
    title: string;
    dancers: string[];
    driveUrl: string;
    act?: string;
    order?: number;
  }> = [];

  let currentOrder = 1;

  for (const line of lines) {
    // Extract URL if present
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
    const driveUrl = urlMatch ? urlMatch[1] : '';
    const withoutUrl = urlMatch ? line.replace(urlMatch[1], '').trim() : line;

    // Check for delimiter '|' or '-' or ':'
    let parts: string[] = [];
    if (withoutUrl.includes('|')) {
      parts = withoutUrl.split('|').map(p => p.trim());
    } else if (withoutUrl.includes(' - ')) {
      parts = withoutUrl.split(' - ').map(p => p.trim());
    } else if (withoutUrl.includes(':')) {
      parts = withoutUrl.split(':').map(p => p.trim());
    } else {
      parts = [withoutUrl];
    }

    let title = parts[0] || `Coreografia ${currentOrder}`;
    // Strip leading numbers like "1. ", "01 - "
    const numMatch = title.match(/^(\d+)[\.\-\)]\s*(.+)$/);
    if (numMatch) {
      currentOrder = parseInt(numMatch[1], 10);
      title = numMatch[2].trim();
    }

    let dancers: string[] = [];
    if (parts.length > 1) {
      // Find dancers part
      const dancersStr = parts[1].replace(/dancers?:|bailarinos?:|elenco:|sapateadores?:/gi, '').trim();
      dancers = dancersStr.split(/[,;&]/).map(d => d.trim()).filter(Boolean);
    }

    results.push({
      title,
      dancers,
      driveUrl,
      order: currentOrder++,
    });
  }

  return results;
}
