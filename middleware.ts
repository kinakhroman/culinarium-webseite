export { auth as middleware } from "./auth";

export const config = {
  matcher: ["/admin/:path*", "/konto/:path*", "/kasse/:path*"],
};
