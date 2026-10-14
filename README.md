# serotask-angular-toaster

Workspace for **[@serotask/angular-toaster](projects/angular-toaster/README.md)**, modern toast notifications for Angular
(4 types, 6 positions, queue, hover-to-pause, themes, animations, actions).

```
projects/
  angular-toaster/  the npm library (source, tests, README, CHANGELOG)
  demo/             demo app to try every feature
.github/workflows/  CI (test + build) and tag-based npm release
```

## Quick start

Requires Node 20.19+ / 22.12+ and npm.

```bash
npm install
npm start          # demo app on http://localhost:4200
npm test           # library unit tests (Vitest)
npm run build:lib  # builds the library into dist/angular-toaster
npm run build:demo # production build of the demo app
npm run pack:check # shows what would be published (after build:lib)
```

The demo imports the library straight from source (see `paths` in `tsconfig.json`),
so `npm start` works without building the library first.

## Try the built package in another app

```bash
npm run build:lib
cd dist/angular-toaster && npm pack      # creates serotask-angular-toaster-1.0.0.tgz
# in your other Angular project:
npm install /path/to/serotask-angular-toaster-1.0.0.tgz
```

## Publish to npm

1. Own the `@serotask` npm scope (create an npm organization named `serotask`).
2. Update `version` in `projects/angular-toaster/package.json` and add an entry to `projects/angular-toaster/CHANGELOG.md`.
3. Publish:
   ```bash
   npm login
   npm run publish:lib
   ```
   or push a tag (`git tag v1.0.0 && git push --tags`) and let `.github/workflows/release.yml` publish
   (needs the repository secret `NPM_TOKEN`).

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

After the first `npm install`, commit `package-lock.json` too.

## License

MIT. See [LICENSE](LICENSE).

## Author

[Satendra Rajput](https://satendra2rajput.com/)
