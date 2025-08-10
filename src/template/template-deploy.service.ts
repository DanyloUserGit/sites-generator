import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

@Injectable()
export class StaticSitesService {
  private servers: Map<string, { process: ChildProcess; port: number }> =
    new Map();
  private portStart = 4000;
  private maxPort = 4999;
  private usedPorts = new Set<number>();

  private runningSites: Map<string, ChildProcess> = new Map();

  getSitePort(slug: string): number | null {
    const serverInfo = this.servers.get(slug);
    if (!serverInfo) return null;

    return serverInfo.port;
  }

  async isSiteRunning(slug: string): Promise<boolean> {
    return this.runningSites.has(slug);
  }

  private findFreePort(): number | null {
    for (let port = this.portStart; port <= this.maxPort; port++) {
      if (!this.usedPorts.has(port)) return port;
    }
    return null;
  }

  startSite(siteSlug: string): number {
    if (this.servers.has(siteSlug)) {
      return this.servers.get(siteSlug).port;
    }

    const port = this.findFreePort();
    if (!port) {
      throw new Error('No free ports available');
    }

    const siteDir = path.join(process.cwd(), 'sites', siteSlug);
    const serverProcess = spawn('node', ['static-site-server.js'], {
      env: {
        ...process.env,
        PORT: port.toString(),
        SITE_DIR: siteDir,
      },
      stdio: 'inherit',
    });

    this.servers.set(siteSlug, { process: serverProcess, port });
    this.usedPorts.add(port);

    serverProcess.on('exit', () => {
      this.servers.delete(siteSlug);
      this.usedPorts.delete(port);
    });

    return port;
  }

  stopSite(siteSlug: string): boolean {
    const server = this.servers.get(siteSlug);
    if (server) {
      server.process.kill();
      this.servers.delete(siteSlug);
      this.usedPorts.delete(server.port);
      return true;
    }
    return false;
  }
}
