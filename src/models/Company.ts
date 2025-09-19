// src/models/Company.ts
import 'reflect-metadata';
import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';

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
export class Company {
  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, unique: true, trim: true, lowercase: true, type: String })
  public email!: string;

  @prop({ required: true, trim: true, type: String })
  public phone!: string;

  @prop({ required: true, trim: true, type: String })
  public address!: string;

  @prop({ required: true, trim: true, type: String })
  public city!: string;

  @prop({ trim: true, type: String })
  public country?: string;

  @prop({ trim: true, type: String })
  public taxId?: string; // RFC, CUIT, etc.

  @prop({ 
    type: String,
    enum: Object.values(SubscriptionStatus), 
    default: SubscriptionStatus.ACTIVE 
  })
  public subscriptionStatus!: SubscriptionStatus;

  @prop({ default: Date.now, type: Date })
  public subscriptionStartDate!: Date;

  @prop({ type: Date })
  public subscriptionEndDate?: Date;

  @prop({ default: 0, type: Number })
  public subscriptionAmount!: number; // Monto de la suscripción

  @prop({ trim: true, type: String })
  public subscriptionCurrency?: string; // USD, MXN, etc.

  @prop({ 
    type: String,
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING 
  })
  public paymentStatus!: PaymentStatus;

  @prop({ type: Date })
  public lastPaymentDate?: Date;

  @prop({ type: Date })
  public nextPaymentDate?: Date;

  @prop({ trim: true, type: String })
  public paymentReference?: string; // Referencia del pago (número de transacción, etc.)

  @prop({ default: true, type: Boolean })
  public active!: boolean;

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
