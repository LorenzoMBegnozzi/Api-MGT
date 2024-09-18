import { Document } from 'mongoose';

export interface User extends Document {
  role: string | PromiseLike<string>;
  username: string;
  password: string;
}
