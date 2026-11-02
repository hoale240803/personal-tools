# TASK-001

## Brief từ Coordinator

**Mục tiêu người dùng:** Tạo file hello world để test Worker hoạt động

**Việc của bạn:** Tạo file `hello.ts` tại `.aise/tasks/sandbox/hello.ts`

**Nội dung cần tạo:**
```typescript
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

console.log(hello("AISE"));
```

**Xong khi:** File tồn tại và chạy được `npx ts-node .aise/tasks/sandbox/hello.ts` (hoặc nếu không có ts-node thì tạo file `.js` thuần)

**Luật:** Đọc `.aise/WORKER.md` trước. Không sửa config.

**Trả về:** Tạo `.aise/tasks/TASK-001-result.md` với diff, output chạy thử, điều chưa chắc.

