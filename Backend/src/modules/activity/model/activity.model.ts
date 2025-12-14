import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType =
  | 'USER_REGISTERED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'SESSION_CREATED'
  | 'SESSION_COMPLETED'
  | 'SESSION_CANCELLED'
  | 'PAYMENT_GENERATED'
  | 'PAYMENT_COMPLETED'
  | 'ORGANIZATION_CREATED'
  | 'ORGANIZATION_UPDATED';

export interface IActivity extends Document {
  organizationId?: Types.ObjectId;
  activityType: ActivityType;
  userId?: Types.ObjectId;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: Types.ObjectId;
  paymentId?: Types.ObjectId;
  amount?: number;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    activityType: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_ACTIVATED',
        'USER_DEACTIVATED',
        'SESSION_CREATED',
        'SESSION_COMPLETED',
        'SESSION_CANCELLED',
        'PAYMENT_GENERATED',
        'PAYMENT_COMPLETED',
        'ORGANIZATION_CREATED',
        'ORGANIZATION_UPDATED',
      ],
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String, lowercase: true },
    userRole: { type: String },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, min: 0 },
    description: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Compound index for querying activities by organization and date
ActivitySchema.index({ organizationId: 1, createdAt: -1 });
ActivitySchema.index({ activityType: 1, createdAt: -1 });

export default model<IActivity>('Activity', ActivitySchema);
