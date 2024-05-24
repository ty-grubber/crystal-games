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

export type Player = {
  gameData: object;
  name: string;
};

export type Connection = {
  gameName: string;
  hostName: string;
  hostIsSpectator: boolean;
  isConnected: boolean;
  players: Player[];
};
