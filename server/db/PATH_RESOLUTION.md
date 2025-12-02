# Database Path Resolution - Explanation

## The Problem

When running scripts from different directories, the database file was not being found.

### Example of the Issue

```bash
# Running from project root - WORKS ✅
npm run ai:example
# Database path: /project/data/tax_alerts.db

# Running from server/ai/ - FAILED ❌
cd server/ai && npm run ai-example
# Database path: /project/server/ai/data/tax_alerts.db (WRONG!)
```

### Why It Happened

The original code used `process.cwd()` (current working directory):

```typescript
// ❌ PROBLEM: Uses current working directory
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'tax_alerts.db');
```

`process.cwd()` returns the directory where the script was **executed from**, not where the code file is located:

- Execute from `/project/` → `process.cwd()` = `/project/` → DB at `/project/data/tax_alerts.db` ✅
- Execute from `/project/server/ai/` → `process.cwd()` = `/project/server/ai/` → DB at `/project/server/ai/data/tax_alerts.db` ❌

---

## The Solution

Use `import.meta.url` to find the file's location, then walk up to find the project root.

### How It Works

```typescript
import { fileURLToPath } from 'url';

/**
 * Find project root by looking for package.json
 */
function findProjectRoot(): string {
  // 1. Get the current module's file path
  const currentFile = fileURLToPath(import.meta.url);
  // Example: /project/server/db/taxAlertService.ts

  // 2. Get the directory
  let dir = path.dirname(currentFile);
  // Example: /project/server/db/

  // 3. Walk up the directory tree
  while (dir !== path.dirname(dir)) {
    // Check if package.json exists in this directory
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;  // Found project root!
    }
    // Go up one level
    dir = path.dirname(dir);
  }

  // Fallback to process.cwd() if not found
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'tax_alerts.db');
```

### Step-by-Step Example

```
1. Start: /project/server/db/taxAlertService.ts

2. Check: /project/server/db/package.json → Not found

3. Go up: /project/server/

4. Check: /project/server/package.json → Not found

5. Go up: /project/

6. Check: /project/package.json → FOUND! ✅

7. Return: /project/

8. DB Path: /project/data/tax_alerts.db ✅
```

---

## Key Concepts

### `import.meta.url`

- **ES Module** feature
- Returns the URL of the current module
- Example: `file:///project/server/db/taxAlertService.ts`

### `fileURLToPath()`

- Converts file URL to file system path
- Input: `file:///project/server/db/taxAlertService.ts`
- Output: `/project/server/db/taxAlertService.ts`

### `process.cwd()`

- Returns **current working directory** (where command was run)
- Changes based on where you execute the command
- **Not reliable** for file paths in modules

### `__dirname` (CommonJS)

- In CommonJS: Available automatically
- In ES Modules: Not available, use `import.meta.url` instead

---

## Comparison

| Approach | Reliable? | Works From Any Directory? |
|----------|-----------|---------------------------|
| `process.cwd()` | ❌ No | ❌ No |
| `import.meta.url` | ✅ Yes | ✅ Yes |
| `__dirname` (CommonJS) | ✅ Yes | ✅ Yes |

---

## Testing

### Test 1: From Project Root

```bash
npm run ai:example
```

**Result:**
- Working directory: `/project/`
- Module location: `/project/server/db/taxAlertService.ts`
- Project root found: `/project/`
- Database path: `/project/data/tax_alerts.db` ✅

### Test 2: From Subdirectory

```bash
cd server/ai
npm run ai-example
```

**Result:**
- Working directory: `/project/server/ai/`
- Module location: `/project/server/db/taxAlertService.ts`
- Project root found: `/project/`
- Database path: `/project/data/tax_alerts.db` ✅

### Test 3: From Any Directory

```bash
cd /tmp
node /project/server/ai/example.ts
```

**Result:**
- Working directory: `/tmp/`
- Module location: `/project/server/db/taxAlertService.ts`
- Project root found: `/project/`
- Database path: `/project/data/tax_alerts.db` ✅

---

## Files Updated

### 1. `server/db/taxAlertService.ts`

**Before:**
```typescript
const DB_DIR = path.join(process.cwd(), 'data');
```

**After:**
```typescript
const PROJECT_ROOT = findProjectRoot();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
```

### 2. `server/db/init.ts`

**Before:**
```typescript
const DB_DIR = path.join(process.cwd(), 'data');
```

**After:**
```typescript
const PROJECT_ROOT = findProjectRoot();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
```

---

## Alternative Solutions

### Option 1: Environment Variable

```typescript
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
```

**Pros:** Simple, explicit
**Cons:** Requires setting environment variable

### Option 2: Config File

```typescript
// config.json
{
  "dbPath": "/absolute/path/to/data/tax_alerts.db"
}
```

**Pros:** Very explicit
**Cons:** Not portable, hardcoded paths

### Option 3: Always Run From Root (Current Solution)

```typescript
const PROJECT_ROOT = findProjectRoot();
```

**Pros:** Works from anywhere, automatic
**Cons:** Requires package.json to exist

---

## Best Practices

### ✅ DO

```typescript
// Use import.meta.url for module-relative paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find project root dynamically
const projectRoot = findProjectRoot();

// Build paths from project root
const dbPath = path.join(projectRoot, 'data', 'db.sqlite');
```

### ❌ DON'T

```typescript
// Don't use process.cwd() for file paths
const dbPath = path.join(process.cwd(), 'data', 'db.sqlite');

// Don't use relative paths
const dbPath = '../../data/db.sqlite';

// Don't hardcode absolute paths
const dbPath = '/Users/me/project/data/db.sqlite';
```

---

## Debugging

If you encounter path issues:

```typescript
// Add logging to understand paths
console.log('Working Directory:', process.cwd());
console.log('Module Location:', fileURLToPath(import.meta.url));
console.log('Project Root:', PROJECT_ROOT);
console.log('Database Path:', DB_PATH);
```

---

## Summary

**Problem:** Database file not found when running from different directories.

**Root Cause:** Using `process.cwd()` which depends on execution location.

**Solution:** Find project root by walking up from module location using `import.meta.url`.

**Result:** Database path is now consistent regardless of where you run the script from.

**Files Changed:**
- `server/db/taxAlertService.ts`
- `server/db/init.ts`

**Now Works:**
✅ From project root: `npm run ai:example`
✅ From subdirectory: `cd server/ai && npm run ai-example`
✅ From any directory with absolute path

---

**Last Updated:** November 13, 2025
