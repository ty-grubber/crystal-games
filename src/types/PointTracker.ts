export type BasketItem = {
  highlighted: boolean,
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

export type Connection = {
  hostName: string;
  gameName: string;
  isConnected: boolean;
  players: {
    name: string,
    gameData: object,
  }[];
}
