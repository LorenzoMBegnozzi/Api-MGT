import { Schema, Document } from 'mongoose';

export const CardSchema = new Schema({
  name: String,
  type: String,
  manaCost: String,
  colors: [String],
  imageUrl: String,
});

export interface Card extends Document {
  name: string;
  type: string;
  manaCost: string;
  colors: string[];
  imageUrl: string;
}
