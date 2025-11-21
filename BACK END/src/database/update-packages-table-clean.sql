DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedDriverId'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedDriverId" UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedDriverName'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedDriverName" VARCHAR(255);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedAt'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedAt" TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'packageCode'
    ) THEN
        ALTER TABLE packages ADD COLUMN "packageCode" VARCHAR(50);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_packages_assignedDriver'
    ) THEN
        ALTER TABLE packages 
        ADD CONSTRAINT "FK_packages_assignedDriver" 
        FOREIGN KEY ("assignedDriverId") REFERENCES drivers(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IDX_packages_assignedDriverId" 
ON packages ("assignedDriverId") 
WHERE "assignedDriverId" IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'UQ_packages_packageCode'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS "UQ_packages_packageCode" 
        ON packages ("packageCode") 
        WHERE "packageCode" IS NOT NULL;
    END IF;
END $$;

