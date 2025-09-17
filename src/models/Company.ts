// src/models/Company.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@modelOptions({
  schemaOptions: {
    collection: 'companies',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ email: 1 })
@index({ subscriptionStatus: 1 })
export class Company {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, unique: true, trim: true, lowercase: true })
  public email!: string;

  @prop({ required: true, trim: true })
  public phone!: string;

  @prop({ required: true, trim: true })
  public address!: string;

  @prop({ required: true, trim: true })
  public city!: string;

  @prop({ trim: true })
  public country?: string;

  @prop({ trim: true })
  public taxId?: string; // RFC, CUIT, etc.

  @prop({ 
    type: String, 
    enum: SubscriptionStatus, 
    default: SubscriptionStatus.ACTIVE 
  })
  public subscriptionStatus!: SubscriptionStatus;

  @prop({ default: Date.now })
  public subscriptionStartDate!: Date;

  @prop()
  public subscriptionEndDate?: Date;

  @prop({ default: 0 })
  public subscriptionAmount!: number; // Monto de la suscripción

  @prop({ trim: true })
  public subscriptionCurrency?: string; // USD, MXN, etc.

  @prop({ 
    type: String, 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  public paymentStatus!: PaymentStatus;

  @prop()
  public lastPaymentDate?: Date;

  @prop()
  public nextPaymentDate?: Date;

  @prop({ trim: true })
  public paymentReference?: string; // Referencia del pago (número de transacción, etc.)

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;

  // Método para verificar si la suscripción está activa
  public isSubscriptionActive(): boolean {
    if (this.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
      return false;
    }
    
    if (this.subscriptionEndDate) {
      return new Date() <= this.subscriptionEndDate;
    }
    
    return true;
  }

  // Método para renovar suscripción
  public renewSubscription(months: number = 1): void {
    this.subscriptionStatus = SubscriptionStatus.ACTIVE;
    this.subscriptionStartDate = new Date();
    this.subscriptionEndDate = new Date();
    this.subscriptionEndDate.setMonth(this.subscriptionEndDate.getMonth() + months);
    this.paymentStatus = PaymentStatus.PAID;
    this.lastPaymentDate = new Date();
    this.nextPaymentDate = new Date();
    this.nextPaymentDate.setMonth(this.nextPaymentDate.getMonth() + months);
  }
}

export const CompanyModel = getModelForClass(Company);
