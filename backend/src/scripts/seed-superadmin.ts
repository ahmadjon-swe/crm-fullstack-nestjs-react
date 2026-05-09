/**
 * Seed script: Creates the first superadmin
 * Run: npx ts-node src/scripts/seed-superadmin.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from '../modules/auth/entities/auth.entity';
import { RolesAdmin } from '../shared/enums/roles.enum';

async function seedSuperAdmin() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Auth],
    synchronize: false,
  });

  await ds.initialize();
  const repo = ds.getRepository(Auth);

  const username = process.env.SUPERADMIN_USERNAME ?? 'superadmin';
  const email = process.env.SUPERADMIN_EMAIL ?? 'superadmin@example.com';
  const name = process.env.SUPERADMIN_NAME ?? 'Super Admin';
  const password = process.env.SUPERADMIN_PASSWORD ?? 'SuperAdmin@123';

  const exists = await repo.findOne({ where: [{ username }, { email }] });
  if (exists) {
    console.log('⚠️  Superadmin already exists. Skipping.');
    await ds.destroy();
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const admin = repo.create({ username, email, name, password: hash, role: RolesAdmin.SUPERADMIN });
  await repo.save(admin);

  console.log('✅ Superadmin created successfully!');
  console.log(`   Username: ${username}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   ⚠️  Change password after first login!');

  await ds.destroy();
}

seedSuperAdmin().catch(console.error);
