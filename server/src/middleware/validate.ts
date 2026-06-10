import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: Joi.ObjectSchema, source: ValidationSource = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      throw new ValidationError(messages);
    }

    req[source] = value;
    next();
  };
};

export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(1).max(100).required(),
    phone: Joi.string().allow('', null).max(20),
  }),

  createProduct: Joi.object({
    nameAr: Joi.string().min(1).max(200).required(),
    nameEn: Joi.string().min(1).max(200).required(),
    descriptionAr: Joi.string().allow('', null),
    descriptionEn: Joi.string().allow('', null),
    shortDescAr: Joi.string().allow('', null),
    shortDescEn: Joi.string().allow('', null),
    price: Joi.number().min(0).default(0),
    sku: Joi.string().allow('', null),
    barcode: Joi.string().allow('', null),
    unitSize: Joi.string().allow('', null),
    categoryId: Joi.number().integer().positive().allow(null),
    servingSize: Joi.string().allow('', null),
    calories: Joi.number().integer().allow(null),
    totalFat: Joi.string().allow('', null),
    saturatedFat: Joi.string().allow('', null),
    transFat: Joi.string().allow('', null),
    cholesterol: Joi.string().allow('', null),
    sodium: Joi.string().allow('', null),
    totalCarbs: Joi.string().allow('', null),
    dietaryFiber: Joi.string().allow('', null),
    sugars: Joi.string().allow('', null),
    protein: Joi.string().allow('', null),
    calcium: Joi.string().allow('', null),
    iron: Joi.string().allow('', null),
    allergenWarningAr: Joi.string().allow('', null),
    allergenWarningEn: Joi.string().allow('', null),
    ingredientsAr: Joi.string().allow('', null),
    ingredientsEn: Joi.string().allow('', null),
  }),

  createCategory: Joi.object({
    nameAr: Joi.string().min(1).required(),
    nameEn: Joi.string().min(1).required(),
    slug: Joi.string()
      .pattern(/^[a-z0-9-]+$/)
      .required(),
    sortOrder: Joi.number().integer().default(0),
  }),

  createJob: Joi.object({
    titleAr: Joi.string().min(1).required(),
    titleEn: Joi.string().min(1).required(),
    departmentAr: Joi.string().min(1).required(),
    departmentEn: Joi.string().min(1).required(),
    locationAr: Joi.string().min(1).required(),
    locationEn: Joi.string().min(1).required(),
    typeAr: Joi.string().min(1).required(),
    typeEn: Joi.string().min(1).required(),
    descriptionAr: Joi.string().allow('', null),
    descriptionEn: Joi.string().allow('', null),
    requirementsAr: Joi.string().allow('', null),
    requirementsEn: Joi.string().allow('', null),
    salaryMin: Joi.number().min(0).allow(null),
    salaryMax: Joi.number().min(0).allow(null),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED').default('PUBLISHED'),
    expiresAt: Joi.date().allow(null),
  }),

  applyJob: Joi.object({
    jobId: Joi.number().integer().positive().required(),
    fullNameAr: Joi.string().min(1).required(),
    fullNameEn: Joi.string().allow('', null),
    email: Joi.string().email().required(),
    phone: Joi.string().min(7).required(),
    coverLetter: Joi.string().allow('', null),
    portfolioUrl: Joi.string().uri().allow('', null),
    linkedInUrl: Joi.string().uri().allow('', null),
  }),

  contactInquiry: Joi.object({
    type: Joi.string()
      .valid('GENERAL', 'DISTRIBUTOR', 'SUPPLIER', 'PARTNERSHIP', 'COMPLAINT')
      .default('GENERAL'),
    fullName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    subject: Joi.string().min(1).required(),
    message: Joi.string().min(10).required(),
  }),

  b2bInquiry: Joi.object({
    companyName: Joi.string().min(1).required(),
    contactName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(7).required(),
    type: Joi.string()
      .valid('GENERAL', 'DISTRIBUTOR', 'SUPPLIER', 'PARTNERSHIP')
      .required(),
    message: Joi.string().min(10).required(),
  }),
};
