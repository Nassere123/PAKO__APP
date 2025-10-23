-- Script pour créer les nouvelles tables selon le diagramme de classes

-- 1. Table des véhicules
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plateNumber VARCHAR(20) UNIQUE NOT NULL,
    loadCapacity DECIMAL(10,2) NOT NULL,
    vehicleType VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    isActive BOOLEAN DEFAULT true,
    deliveryPersonId UUID,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (deliveryPersonId) REFERENCES delivery_persons(id) ON DELETE SET NULL
);

-- 2. Table des adresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postalCode VARCHAR(20) NOT NULL,
    additionalInfo TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    isDefault BOOLEAN DEFAULT false,
    userId UUID NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Table des évaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    evaluationDate TIMESTAMP DEFAULT NOW(),
    customerId UUID NOT NULL,
    deliveryPersonId UUID NOT NULL,
    orderId UUID NOT NULL,
    FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deliveryPersonId) REFERENCES delivery_persons(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

-- 4. Table des missions
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    missionNumber VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT NOW(),
    assignedAt TIMESTAMP,
    startedAt TIMESTAMP,
    completedAt TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NOW(),
    deliveryPersonId UUID,
    FOREIGN KEY (deliveryPersonId) REFERENCES delivery_persons(id) ON DELETE SET NULL
);

-- 5. Table des incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'reported',
    description TEXT NOT NULL,
    correctiveAction TEXT,
    reportedAt TIMESTAMP DEFAULT NOW(),
    resolvedAt TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT NOW(),
    reportedBy UUID NOT NULL,
    FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Ajouter la colonne missionId à la table orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS missionId UUID;
ALTER TABLE orders ADD CONSTRAINT FK_orders_mission 
    FOREIGN KEY (missionId) REFERENCES missions(id) ON DELETE SET NULL;

-- 7. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_vehicles_delivery_person ON vehicles(deliveryPersonId);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(userId);
CREATE INDEX IF NOT EXISTS idx_evaluations_customer ON evaluations(customerId);
CREATE INDEX IF NOT EXISTS idx_evaluations_delivery_person ON evaluations(deliveryPersonId);
CREATE INDEX IF NOT EXISTS idx_evaluations_order ON evaluations(orderId);
CREATE INDEX IF NOT EXISTS idx_missions_delivery_person ON missions(deliveryPersonId);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON incidents(reportedBy);
CREATE INDEX IF NOT EXISTS idx_orders_mission ON orders(missionId);

-- 8. Créer les types énumérés
CREATE TYPE IF NOT EXISTS vehicle_type_enum AS ENUM ('motorcycle', 'car', 'van', 'truck');
CREATE TYPE IF NOT EXISTS mission_status_enum AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE IF NOT EXISTS incident_type_enum AS ENUM ('delivery_delay', 'package_damaged', 'package_lost', 'customer_not_available', 'vehicle_breakdown', 'other');
CREATE TYPE IF NOT EXISTS incident_status_enum AS ENUM ('reported', 'investigating', 'resolved', 'closed');

-- 9. Mettre à jour les colonnes avec les types énumérés
ALTER TABLE vehicles ALTER COLUMN vehicleType TYPE vehicle_type_enum USING vehicleType::vehicle_type_enum;
ALTER TABLE missions ALTER COLUMN status TYPE mission_status_enum USING status::mission_status_enum;
ALTER TABLE incidents ALTER COLUMN type TYPE incident_type_enum USING type::incident_type_enum;
ALTER TABLE incidents ALTER COLUMN status TYPE incident_status_enum USING status::incident_status_enum;

-- 10. Afficher le message de succès
SELECT 'Nouvelles tables créées avec succès selon le diagramme de classes' as message;
