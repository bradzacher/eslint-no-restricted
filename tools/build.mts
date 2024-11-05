import { transform } from 'oxc-transform';
import fs from 'node:fs';
import path from 'node:path';
import glob from 'fast-glob';
import * as rimraf from 'rimraf';

const files = glob.sync('src/**/*.{ts,tsx,cts,mts}', {});

rimraf.sync('dist');
fs.mkdirSync('dist', {
  recursive: true,
});

for (const filePath of files) {
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const transformed = transform(filePath, sourceCode, {
    typescript: {
      onlyRemoveTypeImports: true,
      declaration: { stripInternal: true },
    },
  });

  const parsed = path.parse(filePath);
  const folder = `dist/${parsed.dir.slice('src/'.length)}`;
  const name = parsed.name;
  const [sourceExt, declExt] = (() => {
    if (parsed.ext === '.cts') {
      return ['.cjs', '.d.cts'];
    }
    if (parsed.ext === '.mts') {
      return ['.mjs', '.d.mts'];
    }
    return ['.js', '.d.ts'];
  })();

  fs.writeFileSync(`${folder}/${name}${sourceExt}`, transformed.code, 'utf8');
  if (transformed.declaration) {
    fs.writeFileSync(
      `${folder}/${name}${declExt}`,
      transformed.declaration,
      'utf8',
    );
  }
}
