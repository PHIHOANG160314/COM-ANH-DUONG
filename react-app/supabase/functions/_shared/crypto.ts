import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { sha256 } from "https://deno.land/x/hmac@v2.0.1/src/sha256.ts";
import { sha512 } from "https://deno.land/x/hmac@v2.0.1/src/sha512.ts";

export const hmacSHA512 = (key: string, data: string): string => {
  return hmac(sha512, key, data, "utf8", "hex").toString();
};

export const hmacSHA256 = (key: string, data: string): string => {
  return hmac(sha256, key, data, "utf8", "hex").toString();
};

export const sortObject = (obj: any): any => {
	const sorted: any = {};
	const keys = Object.keys(obj).sort();
	keys.forEach(key => {
		sorted[key] = obj[key];
	});
	return sorted;
}
