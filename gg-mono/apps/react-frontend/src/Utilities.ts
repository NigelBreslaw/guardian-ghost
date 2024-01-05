type CookieOptions = {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

export const setCookie = (name: string, value: string, options?: CookieOptions) => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options) {
    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    if (options.secure) {
      cookieString += "; secure";
    }
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
  }

  document.cookie = cookieString;
};

export const getCookie = (cookieName: string): string | null => {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    if (name === `${encodeURIComponent(cookieName)}`) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
