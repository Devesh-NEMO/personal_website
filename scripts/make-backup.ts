import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { nav, profile } from '../src/data/profile';
import { projects } from '../src/data/projects';
import { skillGroups } from '../src/data/skills';
import { stats } from '../src/data/stats';
import { site } from '../src/data/site';

const backupData = {
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  siteContent: {
    hero: site.hero,
    about: site.about,
    contact: site.contact,
    links: site.links,
    marquee: site.marquee,
    copyright: site.copyright,
    notFound: site.notFound,
    errorPage: site.errorPage,
    splash: site.splash,
    command: site.command,
    analytics: site.analytics,
    nav,
    images: profile,
  },
  projects,
  skillGroups,
  stats,
  messages: [] // Placeholder for dynamic contact messages
};

const outputPath = resolve(process.cwd(), 'backup.json');
writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf8');
console.log('Successfully created backup.json with all static data!');
