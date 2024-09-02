// interfaces/user.interface.ts
import { Document } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
}
