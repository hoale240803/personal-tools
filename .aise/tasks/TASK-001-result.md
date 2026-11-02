## Status
DONE

## Diff tóm tắt
- Đã tạo `.aise/tasks/sandbox/hello.ts`:
```typescript
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

console.log(hello("AISE"));
```
- Do `ts-node` không tương thích với Node.js v24 hiện tại và brief có chỉ định phương án dự phòng "(hoặc nếu không có ts-node thì tạo file `.js` thuần)", đã tạo thêm `.aise/tasks/sandbox/hello.js`:
```javascript
export function hello(name) {
  return `Hello, ${name}!`;
}

console.log(hello("AISE"));
```

## Output verify (nguyên văn)

### 1. Khi chạy lệnh chỉ định trong brief `npx ts-node .aise/tasks/sandbox/hello.ts`:
```
npx : File C:\Program Files\nodejs\npx.ps1 cannot be loaded because running scripts is disabled on this system. For 
more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ npx ts-node .aise/tasks/sandbox/hello.ts
+ ~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

### 2. Khi chạy với `npx.cmd ts-node .aise/tasks/sandbox/hello.ts`:
```
npm warn exec The following package was not found and will be installed: ts-node@10.9.2
C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\configuration.js:91
    const { fileExists = ts.sys.fileExists, readFile = ts.sys.readFile, skipProject = index_1.DEFAULTS.skipProject, project = index_1.DEFAULTS.project, tsTrace = index_1.DEFAULTS.tsTrace, } = rawApiOptions;
                                ^

TypeError: Cannot read properties of undefined (reading 'fileExists')
    at readConfig (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\configuration.js:91:33)
    at findAndReadConfig (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\configuration.js:50:84)
    at phase3 (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\bin.js:254:67)
    at bootstrap (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\bin.js:47:30)
    at main (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\bin.js:33:12)
    at Object.<anonymous> (C:\Users\lehoa\AppData\Local\npm-cache\_npx\1bf7c3c15bf47d04\node_modules\ts-node\dist\bin.js:579:5)
    at Module._compile (node:internal/modules/cjs/loader:1871:14)
    at Object..js (node:internal/modules/cjs/loader:2002:10)
    at Module.load (node:internal/modules/cjs/loader:1594:32)
    at Module._load (node:internal/modules/cjs/loader:1396:12)

Node.js v24.18.0
```

### 3. Khi chạy file JS thuần theo phương án fallback `node .aise/tasks/sandbox/hello.js`:
```
Hello, AISE!
```

### 4. Khi chạy file `.ts` trực tiếp trên Node.js v24 (hỗ trợ native TypeScript stripping) `node .aise/tasks/sandbox/hello.ts`:
```
Hello, AISE!
```

### 5. Khi chạy file `.ts` với `npx.cmd tsx .aise/tasks/sandbox/hello.ts`:
```
Hello, AISE!
```

## Điều chưa chắc / rủi ro
- Môi trường Windows PowerShell mặc định chặn thực thi `npx.ps1` (ExecutionPolicy).
- `ts-node` v10.9.2 không tương thích với Node.js v24.18.0 do lỗi `Cannot read properties of undefined (reading 'fileExists')`. Node 24 hiện tại đã hỗ trợ chạy trực tiếp file `.ts` bằng lệnh `node .aise/tasks/sandbox/hello.ts` mà không cần thêm công cụ ngoài.
