import { Schema, Document, Types } from 'mongoose';

export interface Deck extends Document {
  user: Schema.Types.ObjectId;
  commander: string;
  cards: Schema.Types.ObjectId[];
}

export const DeckSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  commander: { type: String, required: true },
  cards: [{ type: Types.ObjectId, ref: 'Card' }],
  createdAt: { type: Date, default: Date.now },
});
