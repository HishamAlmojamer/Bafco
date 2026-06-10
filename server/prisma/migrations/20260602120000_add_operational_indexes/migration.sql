-- Improve query performance for public catalog, careers, admin queues, and investor pages.
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");
CREATE INDEX "Product_isActive_categoryId_idx" ON "Product"("isActive", "categoryId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_price_idx" ON "Product"("price");
CREATE INDEX "Job_status_expiresAt_idx" ON "Job"("status", "expiresAt");
CREATE INDEX "Job_departmentEn_typeEn_idx" ON "Job"("departmentEn", "typeEn");
CREATE INDEX "JobApplication_jobId_status_idx" ON "JobApplication"("jobId", "status");
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");
CREATE INDEX "ContactInquiry_isRead_createdAt_idx" ON "ContactInquiry"("isRead", "createdAt");
CREATE INDEX "ContactInquiry_type_idx" ON "ContactInquiry"("type");
CREATE INDEX "B2BInquiry_isRead_createdAt_idx" ON "B2BInquiry"("isRead", "createdAt");
CREATE INDEX "B2BInquiry_type_idx" ON "B2BInquiry"("type");
CREATE INDEX "InvestorDocument_isPublished_type_year_idx" ON "InvestorDocument"("isPublished", "type", "year");
CREATE INDEX "InvestorDocument_sortOrder_idx" ON "InvestorDocument"("sortOrder");
CREATE INDEX "NewsArticle_isPublished_category_publishedAt_idx" ON "NewsArticle"("isPublished", "category", "publishedAt");
