// import type { ExpenseStatus } from '../types'

// const platforms = ['Shopee', 'Lazada', 'GrabFood', 'Amazon', 'CGV', 'Tiki', 'Sendo']
// const statuses: ExpenseStatus[] = ['Đã giao', 'Đang giao', 'Chờ xử lý', 'Đã hủy']
// const items = [
//   { name: 'Tai nghe Bluetooth', category: 'Mua sắm > Phụ kiện', parent: 'Mua sắm', amount: 890_000 },
//   { name: 'Trà sữa trân châu', category: 'Ăn uống > Trà sữa', parent: 'Ăn uống', amount: 65_000 },
//   { name: 'Sữa rửa mặt CeraVe', category: 'Chăm sóc cá nhân > Mỹ phẩm', parent: 'Chăm sóc cá nhân', amount: 320_000 },
//   { name: 'Áo thun basic', category: 'Mua sắm > Quần áo', parent: 'Mua sắm', amount: 199_000 },
//   { name: 'Vé phim IMAX', category: 'Tự thưởng bản thân > Xem phim', parent: 'Tự thưởng bản thân', amount: 280_000 },
//   { name: 'Bộ sách self-help', category: 'Tự thưởng bản thân > Sách', parent: 'Tự thưởng bản thân', amount: 450_000 },
//   { name: 'Cơm trưa văn phòng', category: 'Ăn uống > Ăn ngoài', parent: 'Ăn uống', amount: 75_000 },
//   { name: 'Chuột không dây Logitech', category: 'Mua sắm > Điện tử', parent: 'Mua sắm', amount: 550_000 },
//   { name: 'Nước hoa mini', category: 'Chăm sóc cá nhân > Mỹ phẩm', parent: 'Chăm sóc cá nhân', amount: 680_000 },
//   { name: 'Bia craft 6 lon', category: 'Ăn uống > Đồ uống', parent: 'Ăn uống', amount: 240_000 },
// ]

// function buildMockExpenses(): Expense[] {
//   const expenses: Expense[] = [
//     {
//       id: '1',
//       purchaseDate: '2026-07-04',
//       name: 'Sony WH-1000XM5 - Tai nghe chống ồn',
//       category: 'Mua sắm > Phụ kiện',
//       parentCategory: 'Mua sắm',
//       amount: 6_890_000,
//       platform: 'Shopee',
//       status: 'Đã giao',
//       orderId: 'SP2407048821',
//       imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop',
//     },
//     {
//       id: '2',
//       purchaseDate: '2026-07-03',
//       name: 'Combo trà sữa + bánh ngọt',
//       category: 'Ăn uống > Trà sữa',
//       parentCategory: 'Ăn uống',
//       amount: 185_000,
//       platform: 'GrabFood',
//       status: 'Đã giao',
//       orderId: 'GF-8839201',
//       imageUrl: 'https://images.unsplash.com/photo-1558853515-d37a46dee792?w=120&h=120&fit=crop',
//     },
//     {
//       id: '3',
//       purchaseDate: '2026-07-02',
//       name: 'Dầu gội + sữa tắm Dove',
//       category: 'Chăm sóc cá nhân > Mỹ phẩm',
//       parentCategory: 'Chăm sóc cá nhân',
//       amount: 329_000,
//       platform: 'Lazada',
//       status: 'Đang giao',
//       orderId: 'LZD-9928173',
//       imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&h=120&fit=crop',
//     },
//     {
//       id: '4',
//       purchaseDate: '2026-07-01',
//       name: 'Sách "Atomic Habits" (bản tiếng Anh)',
//       category: 'Tự thưởng bản thân > Sách',
//       parentCategory: 'Tự thưởng bản thân',
//       amount: 420_000,
//       platform: 'Amazon',
//       status: 'Đã giao',
//       orderId: 'AMZ-702-4419283',
//       imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=120&fit=crop',
//     },
//     {
//       id: '5',
//       purchaseDate: '2026-06-30',
//       name: 'Vé xem phim + bắp nước',
//       category: 'Tự thưởng bản thân > Xem phim',
//       parentCategory: 'Tự thưởng bản thân',
//       amount: 310_000,
//       platform: 'CGV',
//       status: 'Đã giao',
//       orderId: 'CGV-20260630-88',
//       imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cedd3d4?w=120&h=120&fit=crop',
//     },
//   ]

//   let id = 6
//   for (const month of ['2026-07', '2026-06']) {
//     const daysInMonth = month === '2026-07' ? 4 : 30
//     for (let day = daysInMonth; day >= 1; day--) {
//       if (expenses.length >= 45) break
//       const item = items[(id + day) % items.length]
//       const dayStr = String(day).padStart(2, '0')
//       expenses.push({
//         id: String(id),
//         purchaseDate: `${month}-${dayStr}`,
//         name: item.name,
//         category: item.category,
//         parentCategory: item.parent,
//         amount: item.amount + (id % 5) * 10_000,
//         platform: platforms[id % platforms.length],
//         status: statuses[id % statuses.length],
//         orderId: `ORD-${month.replace('-', '')}${dayStr}-${id}`,
//         imageUrl: `https://picsum.photos/seed/expense-${id}/120/120`,
//       })
//       id++
//     }
//   }

//   return expenses.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
// }

// export const mockExpenses = buildMockExpenses()

// export const mockCategories: CategoryParent[] = [
//   {
//     id: 'p1',
//     name: 'Ăn uống',
//     children: [
//       { id: 'c1', name: 'Đồ uống' },
//       { id: 'c2', name: 'Trà sữa' },
//       { id: 'c3', name: 'Ăn ngoài' },
//     ],
//   },
//   {
//     id: 'p2',
//     name: 'Chăm sóc cá nhân',
//     children: [
//       { id: 'c4', name: 'Làm móng' },
//       { id: 'c5', name: 'Cắt tóc' },
//       { id: 'c6', name: 'Mỹ phẩm' },
//     ],
//   },
//   {
//     id: 'p3',
//     name: 'Mua sắm',
//     children: [
//       { id: 'c7', name: 'Quần áo' },
//       { id: 'c8', name: 'Điện tử' },
//       { id: 'c9', name: 'Phụ kiện' },
//     ],
//   },
//   {
//     id: 'p4',
//     name: 'Tự thưởng bản thân',
//     children: [
//       { id: 'c10', name: 'Đi phượt' },
//       { id: 'c11', name: 'Xem phim' },
//       { id: 'c12', name: 'Sách' },
//     ],
//   },
// ]

// export const mockUser = {
//   name: 'Le Hoa',
//   email: 'lehoa@gmail.com',
//   avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lehoa',
// }
