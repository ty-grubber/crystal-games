export type BasketItem = {
  highlighted: boolean;
  id: string;
  name: string;
  points: number;
  regionFound: string;
};

export type Basket = {
  type: string;
  name: string;
  items: BasketItem[];
};

export type KeyItem = {
  id: string;
  name: string;
  onPoke: boolean;
  points: number;
  upgradeModifier: string;
  upgradeAmt: number;
};

export type Region = {
  description: string;
  items: BasketItem[];
  name: string;
  points: number;
  regionId: number;
};

export type Connection = {
  hostName: string;
  gameName: string;
  isConnected: boolean;
  players: {
    name: string;
    gameData: object;
  }[];
};
