import { Choreography, ShowInfo, ActType, DanceLevel, RehearsalStatus } from '../types';

/**
 * Extracts candidate URLs for fetching the Google Sheet as CSV with CORS support.
 */
export function getCandidateCsvUrls(url: string): string[] {
  const trimmed = url.trim();
  if (!trimmed) return [];

  const candidates: string[] = [];

  // 1. If it's a published web sheet link: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml...
  if (trimmed.includes('/d/e/') && trimmed.includes('/pub')) {
    const cleanPub = trimmed.replace(/\/pubhtml|\/pub.*/, '/pub?output=csv');
    candidates.push(cleanPub);
    // Gviz variation if applicable
    candidates.push(trimmed.replace(/\/pubhtml.*/, '/pub?gid=0&single=true&output=csv'));
  }

  // 2. If it's a standard spreadsheet URL: https://docs.google.com/spreadsheets/d/{ID}/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    // Primary: Google Visualization CSV endpoint (has CORS Access-Control-Allow-Origin: *)
    candidates.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`);
    // Secondary: standard export
    candidates.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`);
  }

  // If already a direct URL
  if (!candidates.includes(trimmed)) {
    candidates.push(trimmed);
  }

  return candidates;
}

/**
 * Fetches Google Sheet CSV content with multiple CORS-safe fallbacks.
 */
export async function fetchGoogleSheetCsv(sheetUrl: string): Promise<string> {
  const candidateUrls = getCandidateCsvUrls(sheetUrl);
  if (candidateUrls.length === 0) {
    throw new Error('Link da planilha do Google Sheets inválido.');
  }

  let lastError: any = null;

  // Try direct endpoints first
  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (response.ok) {
        const text = await response.text();
        // Verify it looks like CSV and not an HTML Google login page
        if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          return text;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  // If direct fetch fails (due to strict browser origin or redirects), try CORS proxy helpers
  const primaryUrl = candidateUrls[0];
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(primaryUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(primaryUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const text = await response.text();
        if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          return text;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    'A planilha não pôde ser acessada. Certifique-se de que a planilha está pública: no Google Sheets, clique em "Compartilhar" ➔ mude para "Qualquer pessoa com o link pode ler" (ou vá em Arquivo ➔ Compartilhar ➔ Publicar na Web).'
  );
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, and commas inside cells.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header strings for flexible column matching.
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Parses raw CSV rows or tab-separated text into Choreography items.
 */
export function parseChoreographiesFromCsv(rawText: string): Choreography[] {
  // If user pasted tab-separated text (directly copied from Google Sheets / Excel cells)
  let csvFormatted = rawText;
  if (rawText.includes('\t') && !rawText.includes('","')) {
    csvFormatted = rawText
      .split('\n')
      .map((line) => {
        return line
          .split('\t')
          .map((cell) => {
            const trimmed = cell.trim();
            if (trimmed.includes(',') || trimmed.includes('"') || trimmed.includes('\n')) {
              return `"${trimmed.replace(/"/g, '""')}"`;
            }
            return trimmed;
          })
          .join(',');
      })
      .join('\n');
  }

  const rows = parseCsvRows(csvFormatted);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  const getColIndex = (aliases: string[]): number => {
    return headers.findIndex((h) => aliases.some((a) => h.includes(normalizeHeader(a))));
  };

  const idxOrder = getColIndex(['ordem', 'numero', 'posicao', 'seq', 'order']);
  const idxTitle = getColIndex(['titulo', 'nome', 'coreografia', 'musicaoucoreo', 'title']);
  const idxAct = getColIndex(['ato', 'bloco', 'secao', 'parte', 'act']);
  const idxLevel = getColIndex(['nivel', 'turma', 'categoria', 'faixa', 'level']);
  const idxDancers = getColIndex(['elenco', 'dancarinos', 'participantes', 'alunos', 'integrantes', 'dancers']);
  const idxChoreo = getColIndex(['coreografo', 'professor', 'responsavel', 'direcao', 'choreographer']);
  const idxMusic = getColIndex(['musica', 'trilha', 'faixa', 'cancao', 'music']);
  const idxArtist = getColIndex(['artista', 'compositor', 'cantor', 'artist']);
  const idxDuration = getColIndex(['duracao', 'minutos', 'tempo', 'tempoestimado', 'duration']);
  const idxDriveUrl = getColIndex(['linkvideo', 'linkdrive', 'videodrive', 'video', 'driveurl', 'link']);
  const idxDriveFolder = getColIndex(['pastadrive', 'pasta', 'drivefolder', 'folder']);
  const idxCostume = getColIndex(['figurino', 'roupa', 'vestuario', 'costume']);
  const idxNotes = getColIndex(['observacoes', 'marcacoes', 'luz', 'cenario', 'notas', 'notes']);
  const idxStatus = getColIndex(['status', 'situacao', 'statusensaio', 'rehearsalstatus']);

  const validActs: ActType[] = ['Abertura', 'Ato 1', 'Ato 2', 'Gran Finale', 'Extra'];
  const validLevels: DanceLevel[] = ['Iniciante', 'Intermediário', 'Avançado', 'Cia Sá Pateia', 'Infantil', 'Geral'];
  const validStatuses: RehearsalStatus[] = ['Pronta para Palco', 'Ajustes Finais', 'Em Ensaio', 'Filmada'];

  const results: Choreography[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const titleVal = idxTitle >= 0 && row[idxTitle] ? row[idxTitle] : `Coreografia ${r}`;
    if (!titleVal || titleVal.trim().length === 0) continue;

    // Order number
    let orderNum = r;
    if (idxOrder >= 0 && row[idxOrder]) {
      const parsedOrder = parseInt(row[idxOrder].replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedOrder) && parsedOrder > 0) {
        orderNum = parsedOrder;
      }
    }

    // Act
    let act: ActType = 'Ato 1';
    if (idxAct >= 0 && row[idxAct]) {
      const rawAct = row[idxAct].trim();
      const matchedAct = validActs.find((a) => a.toLowerCase() === rawAct.toLowerCase());
      if (matchedAct) {
        act = matchedAct;
      } else if (rawAct.toLowerCase().includes('abert')) {
        act = 'Abertura';
      } else if (rawAct.toLowerCase().includes('2') || rawAct.toLowerCase().includes('dois')) {
        act = 'Ato 2';
      } else if (rawAct.toLowerCase().includes('final') || rawAct.toLowerCase().includes('gran')) {
        act = 'Gran Finale';
      }
    }

    // Level
    let level: DanceLevel = 'Intermediário';
    if (idxLevel >= 0 && row[idxLevel]) {
      const rawLvl = row[idxLevel].trim();
      const matchedLvl = validLevels.find((l) => l.toLowerCase() === rawLvl.toLowerCase());
      if (matchedLvl) {
        level = matchedLvl;
      } else if (rawLvl.toLowerCase().includes('infant')) {
        level = 'Infantil';
      } else if (rawLvl.toLowerCase().includes('inic')) {
        level = 'Iniciante';
      } else if (rawLvl.toLowerCase().includes('avan')) {
        level = 'Avançado';
      } else if (rawLvl.toLowerCase().includes('cia') || rawLvl.toLowerCase().includes('sa pateia')) {
        level = 'Cia Sá Pateia';
      }
    }

    // Dancers list
    let dancers: string[] = [];
    if (idxDancers >= 0 && row[idxDancers]) {
      dancers = row[idxDancers]
        .split(/[,;\n\/]+/)
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
    }
    if (dancers.length === 0) {
      dancers = ['Elenco Studio Sá Pateia'];
    }

    // Choreographer
    const choreographer = idxChoreo >= 0 && row[idxChoreo] ? row[idxChoreo].trim() : 'Studio Sá Pateia';

    // Music Title
    const musicTitle = idxMusic >= 0 && row[idxMusic] ? row[idxMusic].trim() : titleVal;

    // Artist
    const artistOrComposer = idxArtist >= 0 && row[idxArtist] ? row[idxArtist].trim() : undefined;

    // Duration
    let duration = '03:30';
    if (idxDuration >= 0 && row[idxDuration]) {
      const rawDur = row[idxDuration].trim();
      if (/^[0-9]{1,2}:[0-9]{2}$/.test(rawDur)) {
        duration = rawDur.padStart(5, '0');
      } else if (/^[0-9]+$/.test(rawDur)) {
        const mins = parseInt(rawDur, 10);
        duration = `${String(mins).padStart(2, '0')}:00`;
      }
    }

    // Google Drive URL
    const driveUrl = idxDriveUrl >= 0 && row[idxDriveUrl] ? row[idxDriveUrl].trim() : '';

    // Google Drive Folder URL
    const driveFolderUrl = idxDriveFolder >= 0 && row[idxDriveFolder] ? row[idxDriveFolder].trim() : undefined;

    // Costume
    const costume = idxCostume >= 0 && row[idxCostume] ? row[idxCostume].trim() : 'Figurino padrão Sá Pateia';

    // Notes
    const notes = idxNotes >= 0 && row[idxNotes] ? row[idxNotes].trim() : undefined;

    // Rehearsal status
    let rehearsalStatus: RehearsalStatus = 'Em Ensaio';
    if (idxStatus >= 0 && row[idxStatus]) {
      const rawStatus = row[idxStatus].trim();
      const matched = validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase());
      if (matched) {
        rehearsalStatus = matched;
      } else if (rawStatus.toLowerCase().includes('pront')) {
        rehearsalStatus = 'Pronta para Palco';
      } else if (rawStatus.toLowerCase().includes('ajust')) {
        rehearsalStatus = 'Ajustes Finais';
      }
    }

    results.push({
      id: `ch-sheet-${orderNum}-${Date.now()}`,
      order: orderNum,
      title: titleVal,
      act,
      level,
      dancers,
      choreographer,
      musicTitle,
      artistOrComposer,
      duration,
      driveUrl,
      driveFolderUrl,
      costume,
      notes,
      rehearsalStatus,
      isFavorite: false,
    });
  }

  return results.sort((a, b) => a.order - b.order);
}

/**
 * Generates the clean CSV template content with example columns ready to be imported into Google Sheets.
 */
export function generateGoogleSheetsTemplateCsv(): string {
  const headers = [
    'Ordem',
    'Titulo da Coreografia',
    'Ato',
    'Nivel',
    'Elenco (Dancarinos separados por virgula)',
    'Coreografo',
    'Musica',
    'Artista / Compositor',
    'Duracao (MM:SS)',
    'Link do Video (Google Drive)',
    'Pasta do Drive',
    'Figurino',
    'Marcacoes e Observacoes',
    'Status do Ensaio',
  ];

  const sampleRows = [
    [
      '1',
      'O Livro Encantado (Abertura)',
      'Abertura',
      'Cia Sá Pateia',
      'Thiago Vinicius, Marina Alencar, Camila Rocha, Lucas Mendes',
      'Direcao Geral Sa Pateia',
      'Hedwigs Flight & Tap Suite',
      'John Williams / Arranjo Sa Pateia',
      '04:15',
      'https://drive.google.com/file/d/SEU_LINK_DO_DRIVE_AQUI/preview',
      'https://drive.google.com/drive/folders/PASTA_DO_DRIVE_AQUI',
      'Sobrecasaca dourada, cartolas iluminadas e sapatos pretos brilhantes.',
      'Entrada cenica pelo centro do palco. Efeitos de fumaca baixa.',
      'Pronta para Palco',
    ],
    [
      '2',
      'Po de Pirlimpimpim',
      'Ato 1',
      'Infantil',
      'Sofia Martins, Beatriz Lima, Alice Nogueira, Gabriel Siqueira',
      'Camila Rocha',
      'A Spoonful of Rhythm',
      'Richard M. Sherman',
      '02:50',
      'https://drive.google.com/file/d/SEU_LINK_DO_DRIVE_AQUI/preview',
      '',
      'Tutus com fitas arco-iris e varinhas de condao com sininhos.',
      'Criancas entram em fila saltitante pela coxia direita.',
      'Em Ensaio',
    ],
    [
      '3',
      'Ritmos da Broadway',
      'Ato 1',
      'Avancado',
      'Thiago Vinicius, Camila Rocha, Juliana Paiva',
      'Thiago Vinicius',
      'Sing, Sing, Sing & Broadway Tap Medley',
      'Benny Goodman',
      '03:40',
      'https://drive.google.com/file/d/SEU_LINK_DO_DRIVE_AQUI/preview',
      '',
      'Coletes pretos acetinados e gravatas borboleta prata.',
      'Duelo de ritmos e canon central.',
      'Ajustes Finais',
    ],
  ];

  const escapeCsv = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [
    headers.map(escapeCsv).join(','),
    ...sampleRows.map((row) => row.map(escapeCsv).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Triggers a browser download of the Google Sheets template CSV file.
 */
export function downloadGoogleSheetsTemplate(): void {
  const csvContent = generateGoogleSheetsTemplateCsv();
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Modelo_Espetaculo_Sa_Pateia_Google_Sheets.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
