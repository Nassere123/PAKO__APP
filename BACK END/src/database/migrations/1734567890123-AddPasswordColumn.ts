import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordColumn1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne existe déjà
    const columnExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);

    if (columnExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN password VARCHAR(255) NULL
      `);

      await queryRunner.query(`
        COMMENT ON COLUMN users.password IS 'Mot de passe hashé (pour les travailleurs uniquement)'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS password
    `);
  }
}

