import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── Fornecedores ──────────────────────────────────────────────
  const supplierA = await prisma.supplier.upsert({
    where: { cnpj: '12345678000195' },
    update: {},
    create: {
      name: 'Distribuidora Fitness ABC',
      cnpj: '12345678000195',
      email: 'contato@fitabc.com',
      phone: '11999998888',
    },
  })

  const supplierB = await prisma.supplier.upsert({
    where: { cnpj: '98765432000111' },
    update: {},
    create: {
      name: 'Suplementos XYZ Ltda',
      cnpj: '98765432000111',
      email: 'vendas@suplexyz.com',
      phone: '21988887777',
    },
  })

  console.log(`✅ Suppliers: ${supplierA.name}, ${supplierB.name}`)

  // ── Produtos + Estoques ───────────────────────────────────────
  const whey = await prisma.product.upsert({
    where: { sku: 'WHY-CH-1KG' },
    update: {},
    create: {
      name: 'Whey Protein 1kg Chocolate',
      description: 'Whey concentrado sabor chocolate, 25g de proteína por dose',
      sku: 'WHY-CH-1KG',
      price: 15990,
      costPrice: 8000,
      category: 'Suplementos',
      supplierId: supplierA.id,
      stock: {
        create: {
          quantity: 0,
          minQuantity: 10,
          location: 'A1',
        },
      },
    },
  })

  const creatine = await prisma.product.upsert({
    where: { sku: 'CRE-UN-300G' },
    update: {},
    create: {
      name: 'Creatina Monohidratada 300g',
      description: 'Creatina pura 100%, aumenta força e performance',
      sku: 'CRE-UN-300G',
      price: 8990,
      costPrice: 4500,
      category: 'Suplementos',
      supplierId: supplierA.id,
      stock: {
        create: {
          quantity: 0,
          minQuantity: 5,
          location: 'A2',
        },
      },
    },
  })

  const shirt = await prisma.product.upsert({
    where: { sku: 'CAM-PT-M' },
    update: {},
    create: {
      name: 'Camiseta Dry-Fit Preta M',
      description: 'Camiseta esportiva dry-fit, tecido respirável',
      sku: 'CAM-PT-M',
      price: 5990,
      costPrice: 2500,
      category: 'Vestuário',
      supplierId: supplierB.id,
      stock: {
        create: {
          quantity: 0,
          minQuantity: 8,
          location: 'B1',
        },
      },
    },
  })

  console.log(`✅ Products: ${whey.name}, ${creatine.name}, ${shirt.name}`)

  // ── Pedido de Compra ──────────────────────────────────────────
  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplierA.id,
      status: 'DRAFT',
      totalCost: 100 * 8000 + 50 * 4500,
      items: {
        create: [
          { productId: whey.id, quantity: 100, unitCost: 8000 },
          { productId: creatine.id, quantity: 50, unitCost: 4500 },
        ],
      },
    },
  })

  console.log(`✅ Purchase order: ${order.id} (${order.status})`)
  console.log('🎉 Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
