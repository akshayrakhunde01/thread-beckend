import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({timestamps:true})
export class Comment {
  @Prop({ required: true })
  text: string;

  @Prop()
  like: number;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Comment' })
  parent: Comment | null;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
