import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { CompositionState } from '@/remotion/types';

// Renderiza o Reel em MP4 na própria máquina, sem nuvem.
// Projetos vão para ./projetos/<nome>.json e vídeos para ./videos/<nome>.mp4
export const runtime = 'nodejs';
export const maxDuration = 600;

function slugify(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'reel';
}

function runRemotion(args: string[], cwd: string): Promise<{ code: number; log: string }> {
  return new Promise((resolve) => {
    const cli = path.join(cwd, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
    const child = spawn(process.execPath, [cli, ...args], { cwd });
    let log = '';
    const collect = (d: Buffer) => {
      log = (log + d.toString()).slice(-4000);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('close', (code) => resolve({ code: code ?? 1, log }));
    child.on('error', (err) => resolve({ code: 1, log: String(err) }));
  });
}

export async function POST(req: NextRequest) {
  const { state, name } = (await req.json()) as { state: CompositionState; name?: string };
  if (!state || !Array.isArray(state.layers)) {
    return NextResponse.json({ error: 'Estado da composição inválido' }, { status: 400 });
  }

  const cwd = process.cwd();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const base = `${slugify(name ?? 'reel')}-${stamp}`;
  const projectFile = path.join('projetos', `${base}.json`);
  const videoFile = path.join('videos', `${base}.mp4`);

  await mkdir(path.join(cwd, 'projetos'), { recursive: true });
  await mkdir(path.join(cwd, 'videos'), { recursive: true });
  await writeFile(path.join(cwd, projectFile), JSON.stringify({ state }, null, 2));

  const args = [
    'render',
    'src/remotion/index.ts',
    'VideoEditor',
    videoFile,
    `--props=${projectFile}`,
    '--codec=h264',
  ];
  // Opcional: usar um Chrome já instalado em vez do que o Remotion baixa
  if (process.env.REMOTION_BROWSER_EXECUTABLE) {
    args.push(`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`);
  }

  const { code, log } = await runRemotion(args, cwd);
  if (code !== 0) {
    return NextResponse.json({ error: 'Falha ao renderizar', log }, { status: 500 });
  }

  return NextResponse.json({
    video: path.join(cwd, videoFile),
    project: path.join(cwd, projectFile),
  });
}
