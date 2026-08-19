export type ActType = 'Abertura' | 'Ato 1' | 'Ato 2' | 'Gran Finale' | 'Extra';

export type DanceLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Cia Sá Pateia' | 'Infantil' | 'Geral';

export type RehearsalStatus = 'Pronta para Palco' | 'Ajustes Finais' | 'Em Ensaio' | 'Filmada';

export interface CuePoint {
  id: string;
  time: string; // e.g. "01:15"
  label: string; // e.g. "Entrada do Grupo 2 - Passo Shim Sham"
  notes?: string;
}

export interface Choreography {
  id: string;
  order: number;
  title: string;
  act: ActType;
  level: DanceLevel;
  dancers: string[];
  choreographer: string;
  musicTitle: string;
  artistOrComposer?: string;
  duration: string; // e.g. "03:45"
  driveUrl: string; // Google Drive file preview or direct video URL
  driveFolderUrl?: string; // Optional folder with rehearsals / multi-angles
  costume: string; // Descrição do figurino
  notes?: string; // Observações cênicas, entroncamento e iluminação
  cuePoints?: CuePoint[];
  rehearsalStatus: RehearsalStatus;
  isFavorite?: boolean;
  coverImage?: string;
  updatedAt?: string;
}

export interface ShowInfo {
  title: string;
  subtitle: string;
  dates: string;
  time: string;
  venue: string;
  city: string;
  studioName: string;
  instagramUrl: string;
  instagramHandle: string;
  masterDriveFolderUrl: string;
}

export type ViewMode = 'grid' | 'lineup' | 'cast' | 'stageManager';
