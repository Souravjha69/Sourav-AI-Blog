// CRA sets NODE_ENV to "production" for `yarn build` (what Vercel runs) and
// "development" for `yarn start`. No live backend exists in the production
// build, so admin/login routes and write actions (like/comment/newsletter)
// are gated on this flag instead of a separate env var.
export const IS_STATIC_SITE = process.env.NODE_ENV === "production";
