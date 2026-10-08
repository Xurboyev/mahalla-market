/** iOS qurilmalarda "cupertino", qolganlarida "android" o'tish animatsiyasi. */
export const theme: "cupertino" | "android" = /iphone|ipad|ipod/i.test(navigator.userAgent)
  ? "cupertino"
  : "android";
