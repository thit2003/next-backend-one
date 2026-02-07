This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Item API & UI

This project includes a full CRUD REST API for an `items` collection and a simple React UI to manage items.

### Environment

Ensure `.env.local` contains `MONGODB_URI` pointing to your MongoDB instance.

### API Endpoints

- `GET /api/items?page=1&limit=10`: Paginated items list. Returns `{ data, page, limit, total, totalPages }`.
- `POST /api/items`: Create item. Body: `{ itemName, itemCategory, itemPrice, status }`.
- `GET /api/items/:id`: Get a single item by id.
- `PATCH /api/items/:id`: Partial update. Body can include any of the item fields.
- `PUT /api/items/:id`: Full replacement. Body must include all required fields.
- `DELETE /api/items/:id`: Delete by id.

### UI Page

- Visit `/items` to access the Item Manager UI.
- Supports pagination, create, inline edit, and delete.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.