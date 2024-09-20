import { Schema, Document } from 'mongoose';

export interface Deck extends Document {
  user: Schema.Types.ObjectId; 
  commander: string;
  cards: Schema.Types.ObjectId[];
}

export const DeckSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commander: { type: String, required: true },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
});
