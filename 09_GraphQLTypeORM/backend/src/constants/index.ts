export const __port__: any = process.env.PORT || 3001;
export const __secrete__: string = "this_need_to_be_hidden";
export const __maxAge__: number = 1000 * 60 * 60 * 24 * 7; // 7 days
export const __secure__: boolean = false;
export const __cookieName__: string = "user";

// Prefixes

export const __reset__password__prefix: string = "reset-password:";
export const __confirm__email__prefix: string = "confirm-email:";
