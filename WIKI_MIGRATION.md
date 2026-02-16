# Migrating Documentation to GitHub Wiki

This guide explains how to migrate the documentation from the `wiki/` folder to GitHub's native Wiki feature.

## Prerequisites

1. **Enable Wiki** in repository settings:
   - Go to: https://github.com/altaskur/OpenTimeTracker/settings
   - Scroll to "Features" section
   - Check ✅ "Wikis"

2. **Create initial page**:
   - Go to: https://github.com/altaskur/OpenTimeTracker/wiki
   - Click "Create the first page"
   - Title: "Home"
   - Content: "Documentation wiki for OpenTimeTracker"
   - Click "Save Page"

## Migration Steps

### Step 1: Clone the Wiki Repository

```bash
# Clone the main repository (if not already)
git clone https://github.com/altaskur/OpenTimeTracker.git
cd OpenTimeTracker

# Clone the wiki repository (separate Git repo)
cd /tmp
git clone https://github.com/altaskur/OpenTimeTracker.wiki.git
cd OpenTimeTracker.wiki
```

### Step 2: Copy Wiki Files

```bash
# Copy all markdown files from main repo to wiki repo
cp /path/to/OpenTimeTracker/wiki/*.md .

# Verify files are copied
ls -la
```

### Step 3: Adjust Internal Links

Wiki files need to have links adjusted (remove `wiki/` prefix):

```bash
# Find and replace wiki/ prefix in links
# macOS/Linux:
sed -i 's|](wiki/|](|g' *.md
sed -i 's|](../wiki/|](|g' *.md

# Or manually edit each file to change:
# [Link](wiki/Page.md) → [Link](Page.md)
# [Link](../wiki/Page.md) → [Link](Page.md)
```

### Step 4: Commit and Push

```bash
git add .
git commit -m "docs: migrate documentation to GitHub Wiki"
git push origin master
```

### Step 5: Verify

Visit https://github.com/altaskur/OpenTimeTracker/wiki to verify:
- All pages are visible
- Navigation works
- Links between pages work correctly

### Step 6: Clean Up Main Repository (Optional)

If you want to remove wiki/ from main repo after migration:

```bash
cd /path/to/OpenTimeTracker
git rm -r wiki/
git commit -m "docs: remove wiki folder (migrated to GitHub Wiki)"
git push
```

---

## Alternative: Keep Both

You can keep documentation in both places:

**Main Repo (`wiki/` folder)**:
- ✅ Versioned with code
- ✅ PR review process
- ✅ Works offline
- ✅ Clone with repo

**GitHub Wiki** (separate repo):
- ✅ Native wiki UI
- ✅ Easy web editing
- ✅ Built-in search

**Sync strategy**: Manually copy from `wiki/` to GitHub Wiki when making documentation updates.

---

## Files to Migrate

The following files are ready to migrate:

- `Home.md` - Main wiki entry point
- `Getting-Started.md` - Installation and setup
- `Architecture.md` - Technical architecture
- `Database-Schema.md` - Database documentation
- `Development-Setup.md` - Developer guide
- `Build-and-Deployment.md` - Build process
- `Troubleshooting.md` - Common issues
- `FAQ.md` - Frequently asked questions
- `Contributing.md` - Contribution guide
- `Security.md` - Security policy
- `Roadmap.md` - Future plans
- `README.md` - Wiki index

---

## Troubleshooting

### Wiki not enabled
- Check repository settings → Features → Wikis must be checked

### Permission denied on push
- Ensure you have write access to the repository
- Check GitHub credentials are configured

### Links broken after migration
- Verify all internal links use format `[Text](Page.md)` without `wiki/` prefix
- GitHub Wiki uses page names, not file paths

---

## Questions?

For issues with migration, contact the repository maintainer or open an issue.
