/**
 * Catalyst Database Seeder
 * 
 * Main seeder that orchestrates other seeders.
 */

// Import individual seeders
// import UserSeeder from './UserSeeder';

export default async function seed() {
  console.log('[Seeder] Starting database seeding...\n');

  // Run seeders in order
  // await UserSeeder();
  
  console.log('');
  console.log('[Seeder] ✓ Database seeding completed!');
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('[Seeder] Seeding failed:', error);
      process.exit(1);
    });
}
