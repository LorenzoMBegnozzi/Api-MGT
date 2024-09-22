import { Schema, Document } from 'mongoose';

export interface Card extends Document {
  name: string;
  type: string;
  manaCost: string;
  colors: string[];
  scryfallId: string; // Certifique-se de que este campo esteja aqui
  imageUrl: string;
}

export const CardSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  manaCost: { type: String, required: true },
  colors: { type: [String], required: true },
  scryfallId: { type: String, required: true }, // Adicione esta linha se não estiver lá
  imageUrl: { type: String, required: true },
});
