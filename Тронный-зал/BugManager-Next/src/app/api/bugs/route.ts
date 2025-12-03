import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

interface BugMeta {
  name: string;
  emoji: string;
  language?: string;
  description?: string;
}

interface RoomPayload {
  id: string;
  label: string;
  bugs: BugMeta[];
}

const CASTLE_ROOT = 'c:\\Users\\Public\\LilyCastle';
const ROOM_NAME_PATTERN = /^\d{2}-/;

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

function prettifyRoomLabel(roomId: string): string {
  const [, labelPart] = roomId.split(/-(.+)/);
  return labelPart ? labelPart : roomId;
}

function readBugMetadata(roomPath: string, bugFolder: string): BugMeta | null {
  const metadataPath = join(roomPath, bugFolder, '.bug');
  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const raw = readFileSync(metadataPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name ?? bugFolder,
      emoji: parsed.emoji ?? '🐛',
      language: parsed.language,
      description: parsed.description,
    };
  } catch (error) {
    console.error(`Не удалось прочитать ${metadataPath}:`, error);
    return null;
  }
}

function collectRooms(): RoomPayload[] {
  try {
    const roomEntries = readdirSync(CASTLE_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && ROOM_NAME_PATTERN.test(entry.name));

    const rooms: RoomPayload[] = roomEntries.map((roomEntry) => {
      const roomPath = join(CASTLE_ROOT, roomEntry.name);
      const bugs = readdirSync(roomPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((bugEntry) => readBugMetadata(roomPath, bugEntry.name))
        .filter((bug): bug is BugMeta => Boolean(bug))
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ru'));

      return {
        id: roomEntry.name,
        label: prettifyRoomLabel(roomEntry.name),
        bugs,
      };
    });

    return rooms.sort((a, b) => collator.compare(a.id, b.id));
  } catch (error) {
    console.error('Ошибка при сканировании жуков:', error);
    return [];
  }
}

export async function GET() {
  try {
    const rooms = collectRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load bugs' }, { status: 500 });
  }
}
