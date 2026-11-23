const fs = require('fs');

// 1. Update capital.controller.ts
let controller = fs.readFileSync('apps/api/src/workit/capital.controller.ts', 'utf8');
controller = controller.replace(
  'import { Controller, Get, Post, Body, Query } from "@nestjs/common";',
  'import { Controller, Get, Post, Put, Body, Query, Param } from "@nestjs/common";'
);

const assetPostIdx = controller.indexOf('createAsset(@Body() body: any) {');
if (assetPostIdx !== -1) {
  const methodEndIdx = controller.indexOf('}', assetPostIdx) + 1;
  const updateEndpoint = `

  @Put("assets/:id")
  @Roles("admin", "accountant")
  updateAsset(@Param("id") id: string, @Body() body: any) {
    return this.workit.updateCapitalAsset(id, body);
  }`;
  
  if (!controller.includes('updateAsset(')) {
    controller = controller.slice(0, methodEndIdx) + updateEndpoint + controller.slice(methodEndIdx);
  }
}
fs.writeFileSync('apps/api/src/workit/capital.controller.ts', controller, 'utf8');
console.log('Updated capital.controller.ts');

// 2. Update workit.service.ts
let service = fs.readFileSync('apps/api/src/workit/workit.service.ts', 'utf8');

const createAssetTarget = 'async createCapitalAsset(input: CreateCapitalAssetInput) {';
const createAssetIdx = service.indexOf(createAssetTarget);

if (createAssetIdx !== -1) {
  const methodEndIdx = service.indexOf('  async listShareholders() {', createAssetIdx);
  const updateAssetMethod = `  async updateCapitalAsset(id: string, input: Partial<CreateCapitalAssetInput>) {
    const context = await this.ensureDefaultContext();
    const existing = await this.prisma.fixed_assets.findFirst({
      where: {
        id,
        organization_id: context.organization.id
      }
    });

    if (!existing) {
      throw new NotFoundException(\`Không tìm thấy tài sản với ID \${id}\`);
    }

    const updated = await this.prisma.fixed_assets.update({
      where: { id },
      data: {
        asset_name: input.assetName !== undefined ? input.assetName : existing.asset_name,
        asset_category: input.category !== undefined ? input.category : existing.asset_category,
        acquisition_date: input.acquisitionDate ? new Date(input.acquisitionDate) : existing.acquisition_date,
        original_cost: input.originalCost !== undefined ? input.originalCost : existing.original_cost,
        residual_value: input.residualValue !== undefined ? input.residualValue : existing.residual_value,
        useful_life_months: input.usefulLifeMonths !== undefined ? Number(input.usefulLifeMonths) : existing.useful_life_months,
        source_record_id: input.supplierOrBrand !== undefined ? input.supplierOrBrand : existing.source_record_id,
        depreciation_method: input.notes !== undefined ? input.notes : existing.depreciation_method,
        updated_at: new Date()
      }
    });

    return updated;
  }

`;
  if (!service.includes('updateCapitalAsset(id: string')) {
    service = service.slice(0, methodEndIdx) + updateAssetMethod + service.slice(methodEndIdx);
  }
}

fs.writeFileSync('apps/api/src/workit/workit.service.ts', service, 'utf8');
console.log('Updated workit.service.ts');
