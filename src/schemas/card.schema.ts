import { Schema, Document } from 'mongoose';

export const CardSchema = new Schema({
  name: String,
  type: String,
  manaCost: String,
  colors: [String],
  imageUrl: String,
  // Adicione outros campos conforme necessário
});

// Definindo o tipo CardDocument que extende o Document do Mongoose
export interface Card {
  name: string;
  type: string;
  manaCost: string;
  colors: string[];
  imageUrl: string;
}

export type CardDocument = Card & Document;
