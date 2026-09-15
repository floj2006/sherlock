export type AccountUser = { id: string; fullname: string; email: string; phone: string; createdAt: number };
export type AccountVisit = { recordId: number; datetime: string; services: string[]; serviceSlugs: string[]; master: string; priceMin: number; priceMax: number };
