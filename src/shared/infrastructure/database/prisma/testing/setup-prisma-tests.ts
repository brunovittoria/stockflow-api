import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Load .env.test so integration tests always use the test database
config({ path: '.env.test', override: true })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

// Order respects FK constraints: items → orders → stocks → products → suppliers
export async function cleanDatabase() {
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
}

export { prisma }
