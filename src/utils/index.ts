import { exec } from 'child_process';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'tldts';

export function execAsync(command: string, options: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
    if (options.stdio === 'inherit') {
      child.stdout?.pipe(process.stdout);
      child.stderr?.pipe(process.stderr);
    }
  });
}
export async function createZip(srcDir: string, destZip: string) {
  const output = fs.createWriteStream(destZip);
  const archive = archiver.default('zip', { zlib: { level: 9 } });

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}
export function extractZoneFromDomain(domain: string): string {
  const result = parse(domain);
  if (!result.domain) {
    throw new Error(`Cannot extract zone from: ${domain}`);
  }
  return result.domain;
}
