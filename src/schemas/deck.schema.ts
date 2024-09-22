import { Schema, Document, Types } from 'mongoose';
import { Card } from './card.schema';

export const DeckSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  commander: { type: String, required: true },
  cards: [{ type: Types.ObjectId, ref: 'Card' }], 
  createdAt: { type: Date, default: Date.now },
});

export interface Deck {
  user: Types.ObjectId;
  commander: string;
  cards: string[];
  createdAt: Date;
}

export type DeckDocument = Deck & Document;
