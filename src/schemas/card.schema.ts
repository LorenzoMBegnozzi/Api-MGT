import { Schema, Document } from 'mongoose';

export const CardSchema = new Schema({
  name: { type: String, required: true },
  scryfallId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  manaCost: { type: String },
  colors: { type: [String] },
  imageUrl: { type: String },
});

export interface Card {
  name: string;
  type: string;
  manaCost?: string;
  colors?: string[];
  scryfallId: string;
  imageUrl?: string;
}

export type CardDocument = Card & Document;
