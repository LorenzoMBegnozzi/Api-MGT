import { Schema, Document } from 'mongoose';

// Define a interface Deck
export interface Deck extends Document {
  commander: string;
  cards: Schema.Types.ObjectId[]; 
}

// Define o schema do Deck
export const DeckSchema = new Schema({
  commander: { type: String, required: true },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }], 
});
