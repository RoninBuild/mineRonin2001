export type SkinCategory = 'fields' | 'flags';

export type SkinTier = 1 | 5 | 10;

export type Skin = {
  id: number;
  name: string;
  category: SkinCategory;
  tier: SkinTier;
  owned: boolean;
};

export type PurchaseRequest = {
  category: SkinCategory;
  tier: SkinTier;
  skinIndex: number;
};
