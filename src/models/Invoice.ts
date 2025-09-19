// src/models/Invoice.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Supplier } from './Supplier';
import { Branch } from './Branch';
import { User } from './User';
import { Company } from './Company';

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
@index({ company: 1 })
@index({ invoiceNumber: 1, company: 1 }, { unique: true })
@index({ supplier: 1 })
@index({ branch: 1 })
@index({ status: 1 })
@index({ invoiceDate: -1 })
@index({ createdAt: -1 })
export class Invoice {
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public invoiceNumber!: string; // Número de factura único

  @prop({ ref: () => Supplier, required: true, type: () => String })
  public supplier!: Ref<Supplier>;

  @prop({ ref: () => Branch, required: true, type: () => String })
  public branch!: Ref<Branch>;

  @prop({ ref: () => User, required: true, type: () => String })
  public createdBy!: Ref<User>; // Usuario que creó la factura

  @prop({ required: true, type: Date })
  public invoiceDate!: Date; // Fecha de la factura

  @prop({ required: true, type: Date })
  public dueDate!: Date; // Fecha de vencimiento

  @prop({ type: [Object], required: true })
  public items!: InvoiceItem[]; // Items de la factura

  @prop({ required: true, min: 0, type: Number })
  public subtotal!: number; // Subtotal sin impuestos

  @prop({ required: true, min: 0, default: 0, type: Number })
  public taxAmount!: number; // Monto de impuestos

  @prop({ required: true, min: 0, default: 0, type: Number })
  public discountAmount!: number; // Monto de descuento

  @prop({ required: true, min: 0, type: Number })
  public totalAmount!: number; // Monto total de la factura

  @prop({ 
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'], 
    default: 'pending' 
  })
  public status!: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';

  @prop({ trim: true, type: String })
  public notes?: string; // Notas adicionales

  @prop({ trim: true, type: String })
  public paymentMethod?: string; // Método de pago

  @prop({ type: Date })
  public paymentDate?: Date; // Fecha de pago

  @prop({ trim: true, type: String })
  public paymentReference?: string; // Referencia de pago

  @prop({ ref: () => User, type: () => String })
  public approvedBy?: Ref<User>; // Usuario que aprobó la factura

  @prop({ type: Date })
  public approvedAt?: Date; // Fecha de aprobación

  @prop({ trim: true, type: String })
  public rejectionReason?: string; // Razón de rechazo si aplica

  @prop({ default: true, type: Boolean })
  public active!: boolean;

  @prop({ type: Object })
  public additionalData?: Record<string, any>;
}

export const InvoiceModel = getModelForClass(Invoice);
