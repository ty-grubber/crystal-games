export type BasketItem = {
  id: string,
  name: string,
  points: number,
  regionFound: string,
};

export type Basket = {
  type: string,
  name: string,
  items: BasketItem[],
};

export type Region = {
  description: string,
  items: BasketItem[],
  name: string,
  points: number,
  regionId: number,
}
