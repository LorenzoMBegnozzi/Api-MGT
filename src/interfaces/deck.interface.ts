export interface Commander {
  name: string;
  color_identity: string[];
}

export interface Card {
  _id: any;
  name: string;
  type_line: string;
  mana_cost?: string;
  colors?: string[];
  image_uris?: {
    normal: string;
  };
}

export interface DeckJson {
  commander: Commander;
  cards: Card[];
}
