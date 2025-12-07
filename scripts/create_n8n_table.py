#!/usr/bin/env python3
"""
Script para crear la tabla n8n_alert_logs en PostgreSQL
"""

import psycopg2
from psycopg2 import sql

# Credenciales de la base de datos
DB_CONFIG = {
    'host': 'dpg-d4q9m7q4i8rc73flvhjg-a.virginia-postgres.render.com',
    'port': 5432,
    'database': 'bd_pat_ah',
    'user': 'bd_pat_ah_user',
    'password': 'd2zf7ADO3LIBeH6HHE0WnkuyNoIHp01A'
}

# SQL para crear la tabla
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS n8n_alert_logs (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    descripcion TEXT,
    recipients TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def create_table():
    """Crea la tabla n8n_alert_logs"""
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Ejecutar el SQL
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()
        
        print("✅ Tabla 'n8n_alert_logs' creada exitosamente")
        
        # Verificar que la tabla existe
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'n8n_alert_logs'
        """)
        
        columns = cursor.fetchall()
        print("\n📋 Columnas de la tabla:")
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error de base de datos: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔄 Creando tabla en PostgreSQL...")
    success = create_table()
    if success:
        print("\n✅ Operación completada exitosamente")
    else:
        print("\n❌ Operación fallida")
