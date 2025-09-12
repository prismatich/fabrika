// src/models/Invoice.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Supplier } from './Supplier';
import { Branch } from './Branch';
import { User } from './User';

// Interfaz para los items de la factura
export interface InvoiceItem {
  rawMaterial: string; // ID de la materia prima
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string; // kg, litros, piezas, etc.
}

@modelOptions({
  schemaOptions: {
    collection: 'invoices',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ invoiceNumber: 1 })
@index({ supplier: 1 })
@index({ branch: 1 })
@index({ status: 1 })
@index({ invoiceDate: -1 })
@index({ createdAt: -1 })
export class Invoice {
  @prop({ required: true, unique: true, trim: true })
  public invoiceNumber!: string; // Número de factura único

  @prop({ ref: () => Supplier, required: true })
  public supplier!: Ref<Supplier>;

  @prop({ ref: () => Branch, required: true })
  public branch!: Ref<Branch>;

  @prop({ ref: () => User, required: true })
  public createdBy!: Ref<User>; // Usuario que creó la factura

  @prop({ required: true })
  public invoiceDate!: Date; // Fecha de la factura

  @prop({ required: true })
  public dueDate!: Date; // Fecha de vencimiento

  @prop({ type: () => [Object], required: true })
  public items!: InvoiceItem[]; // Items de la factura

  @prop({ required: true, min: 0 })
  public subtotal!: number; // Subtotal sin impuestos

  @prop({ required: true, min: 0, default: 0 })
  public taxAmount!: number; // Monto de impuestos

  @prop({ required: true, min: 0, default: 0 })
  public discountAmount!: number; // Monto de descuento

  @prop({ required: true, min: 0 })
  public totalAmount!: number; // Monto total de la factura

  @prop({ 
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'], 
    default: 'pending' 
  })
  public status!: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';

  @prop({ trim: true })
  public notes?: string; // Notas adicionales

  @prop({ trim: true })
  public paymentMethod?: string; // Método de pago

  @prop()
  public paymentDate?: Date; // Fecha de pago

  @prop({ trim: true })
  public paymentReference?: string; // Referencia de pago

  @prop({ ref: () => User })
  public approvedBy?: Ref<User>; // Usuario que aprobó la factura

  @prop()
  public approvedAt?: Date; // Fecha de aprobación

  @prop({ trim: true })
  public rejectionReason?: string; // Razón de rechazo si aplica

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;
}

export const InvoiceModel = getModelForClass(Invoice);
