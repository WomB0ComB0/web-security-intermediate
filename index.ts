import { $ } from 'bun';
import { spawn } from 'node:child_process';
import type { KebabCase } from 'type-fest';
import { existsSync } from 'node:fs';

(async () => {
  const titles: string[] = [
    "Authentication and Authorization",
    "Data Encryption",
    "Input Validation",
    "Secure Session Management",
    "Cross-Site Request Forgery (CSRF) Protection",
    "Cross-Site Scripting (XSS) Protection",
    "Security Headers",
    "Intrusion Detection and Prevention Systems (IDPS)",
    "Regular Security Audits and Vulnerability Assessments",
    "Secure Development Practices",
    "Logging and Monitoring",
    "Patch Management",
    "Firewall and Network Security",
    "Backup and Recovery",
    "Security Awareness Training",
    "Third-Party Component Management",
    "Compliance and Regulatory Adherence",
    "Secure API Management",
    "Mobile Security Measures",
    "Physical Security",
  ]
  const slugify = (str: string, forDisplayingInput?: boolean): KebabCase<string> => {
    if (!str) {
      return '';
    }

    const s = str
      .toLowerCase() // Convert to lowercase
      .trim() // Remove whitespace from both sides
      .normalize('NFD') // Normalize to decomposed form for handling accents
      .replace(/\p{Diacritic}/gu, '') // Remove any diacritics (accents) from characters
      .replace(/[^.\p{L}\p{N}\p{Zs}\p{Emoji}]+/gu, '-') // Replace any non-alphanumeric characters (including Unicode and except "." period) with a dash
      .replace(/[\s_#]+/g, '-') // Replace whitespace, # and underscores with a single dash
      .replace(/^-+/, '') // Remove dashes from start
      .replace(/\.{2,}/g, '.') // Replace consecutive periods with a single period
      .replace(/^\.+/, '') // Remove periods from the start
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        '',
      ) // Removes emojis
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-'); // Replace consecutive dashes with a single dash

    return forDisplayingInput ? s : s.replace(/-+$/, '').replace(/\.*$/, ''); // Remove dashes and period from end
  };

  const executeCommand = async (
    command: string,
    args: string[],
    cwd: string,
    silent = false
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: silent ? 'ignore' : 'inherit',
        cwd: cwd,
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}`));
        }
      });

      process.on('error', reject);
    });
  };

  const slugs = titles.map((title) => slugify(title));

  (async () => {
    try {
      const createPromises = slugs.map(async (slug) => {
        if (existsSync(`./${slug}`)) {
          console.log(`${slug} already exists, skipping...`);
          return;
        }
        
        console.log(`Creating ${slug}...`);
        await executeCommand(
          'npx', [
            'create-next-app@latest',
            slug,
            '--app',
            '--typescript',
            '--tailwind',
            '--eslint',
            '--src-dir',
            '--turbo',
            '--import-alias', '@/*',
            '--yes'
          ],
          process.cwd(),
        );

        // await executeCommand(
        //   'bun',
        //   ['install'],
        //   slug,
        // );
      });

      await Promise.all(createPromises);
      console.log('All projects created successfully');
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : error}`);
    }
  })()
})()