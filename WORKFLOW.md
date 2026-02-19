# Shopify Theme + GitHub Workflow

This document describes how to keep your local theme in sync with Shopify and save changes to GitHub.

---

## Prerequisites

- **Git** – installed via Homebrew (`brew install git`)
- **Shopify CLI** – for theme pull/push
- **GitHub** – repo connected at `https://github.com/gooderabrand/goodera.git`

### Install Shopify CLI

```bash
# Option A: Via Homebrew (recommended)
brew tap shopify/shopify
brew install shopify-cli

# Option B: Via npm
npm install -g @shopify/cli @shopify/theme
```

Verify: `shopify version`

---

## 1. Pull Latest Theme from Shopify

Use this when you want to sync your local project with the live theme on Shopify (e.g., after changes in the theme editor or from another developer).

```bash
cd "/Users/trell/Library/Mobile Documents/com~apple~CloudDocs/Good Era/Website Good Era v2"

# Pull from your LIVE theme (production)
shopify theme pull --live

# OR pull from a specific theme by ID
shopify theme pull --theme <THEME_ID>

# OR pull from development theme
shopify theme pull --development
```

**First-time setup:** If not logged in, run `shopify auth login --store your-store.myshopify.com` and complete the browser auth.

**Important:** `theme pull` overwrites local files with the remote theme. Commit or stash local changes first if you want to keep them.

---

## 2. Recommended Workflow Order

### Before pulling from Shopify

1. **Commit or stash local changes** so you don’t lose work:
   ```bash
   git status
   git add .
   git commit -m "chore: save work before theme pull"
   # OR
   git stash push -m "Before theme pull"
   ```

2. **Pull from Shopify:**
   ```bash
   shopify theme pull --live
   ```

3. **Review changes:**
   ```bash
   git status
   git diff
   ```

4. **Commit the pulled theme:**
   ```bash
   git add .
   git commit -m "chore: sync theme from Shopify (theme pull)"
   git push origin <your-branch>
   ```

---

## 3. Saving Changes to GitHub

### Commit message format

Use the prefixes from `COMMIT_GUIDELINES.md`:

| Prefix     | Use for                                      |
|-----------|-----------------------------------------------|
| `feat:`   | New section/component/functionality          |
| `fix:`    | Bug fixes                                    |
| `style:`  | Design-only changes                          |
| `chore:`  | Cleanup, setup, non-feature                  |
| `refactor:` | Logic or structural change without feature |

### Typical workflow

```bash
# 1. Check what changed
git status
git diff

# 2. Stage files
git add .
# Or stage specific files: git add sections/header-group.json

# 3. Commit with a descriptive message
git commit -m "feat: add hero banner section with parallax"

# 4. Push to GitHub
git push origin archive/original-theme-version
# Or your main branch: git push origin main
```

### Branch strategy

- **`archive/original-theme-version`** – current branch (archive of original theme)
- Consider a **`main`** or **`development`** branch for ongoing work
- Use feature branches for larger changes: `git checkout -b feat/hero-banner`

---

## 4. Quick Reference Commands

| Task                    | Command                                              |
|-------------------------|------------------------------------------------------|
| Pull live theme         | `shopify theme pull --live`                          |
| Pull dev theme          | `shopify theme pull --development`                   |
| Push theme to Shopify   | `shopify theme push`                                 |
| Start dev server        | `shopify theme dev`                                  |
| Check git status        | `git status`                                         |
| Commit changes          | `git add . && git commit -m "type: description"`     |
| Push to GitHub          | `git push origin <branch>`                            |
| List themes             | `shopify theme list`                                 |

---

## 5. Current Setup Summary

- **Theme:** Reformation 8.3.0 (Fuel Themes)
- **Git remote:** `origin` → `https://github.com/gooderabrand/goodera.git`
- **Current branch:** `archive/original-theme-version`
- **Uncommitted changes:** Run `git status` to see current state

---

## 6. Notes

- `.shopify` is in `.gitignore` – local CLI config is not committed
- Always pull on a clean or committed working tree to avoid merge conflicts
- Test changes on a duplicate theme before pushing to live
