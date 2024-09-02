import { Schema, Document } from 'mongoose';

// Define a interface Deck
export interface Deck extends Document {
  commander: string;
  cards: Schema.Types.ObjectId[]; // Assumindo que você está armazenando IDs das cartas como ObjectId
}

// Define o schema do Deck
export const DeckSchema = new Schema({
  commander: { type: String, required: true },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }], // Referência ao modelo Card
});
