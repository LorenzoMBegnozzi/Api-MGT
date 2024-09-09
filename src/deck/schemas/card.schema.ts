import { Schema, Document } from 'mongoose';

export interface Card extends Document {
  name: string;
  type: string;
  manaCost: string;
  colors: string[];
  imageUrl?: string;
}

export const CardSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  manaCost: { type: String },
  colors: [{ type: String }],
  imageUrl: { type: String }
});
