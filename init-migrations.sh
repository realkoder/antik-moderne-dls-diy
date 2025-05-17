#!/bin/bash

# This script is exectued first time postgresql is initaited or else manually by: docker exec -it postgresdb /docker-entrypoint-initdb.d/run-migrations.sh
export PGPASSWORD="$POSTGRES_PASSWORD"

# Loop through each migration directory for different services
for SERVICE_DIR in /docker-entrypoint-initdb.d/migrations_*; do
    # Extract the database name from the directory name
    DB_NAME=$(basename "${SERVICE_DIR}" | cut -d'_' -f2)

    # Check if the database exists
    if ! psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "Database ${DB_NAME} does not exist. Creating database ${DB_NAME}."
        createdb -U "$POSTGRES_USER" "$DB_NAME"
    else
        echo "Database ${DB_NAME} exists."

        # Check the collation of the existing database
        COLLATION=$(psql -U "$POSTGRES_USER" -d "$DB_NAME" -t -c "SELECT datcollate FROM pg_database WHERE datname = '$DB_NAME';")
        
        # Set the desired collation if it is not correct
        if [ "$COLLATION" != "en_US.UTF-8" ]; then
            echo "Setting collation for database ${DB_NAME} to en_US.UTF-8."
            psql -U "$POSTGRES_USER" -d "$DB_NAME" -c "ALTER DATABASE \"$DB_NAME\" SET LC_COLLATE TO 'en_US.UTF-8';"
            psql -U "$POSTGRES_USER" -d "$DB_NAME" -c "ALTER DATABASE \"$DB_NAME\" SET LC_CTYPE TO 'en_US.UTF-8';"
        else
            echo "Collation for database ${DB_NAME} is already set correctly."
        fi
    fi

    # Connect to the relevant database
    psql -U "$POSTGRES_USER" -d "$DB_NAME" -c "SELECT 'Connected to ${DB_NAME}' AS message;"

    echo "Processing migrations in ${SERVICE_DIR}"

    # Loop through all directories and subdirectories in the migration folder
    for dir in "${SERVICE_DIR}"/*; do
        if [ -d "$dir" ]; then  # Check if it's a directory
            echo "Processing migrations in directory: ${dir}"
            # Loop through all SQL files in the current directory and its subdirectories
            find "$dir" -type f -name '*.sql' | sort | while read -r f; do
                if [ -f "$f" ]; then  # Check if the file exists
                    echo "Executing migration: ${f}"
                    psql -v ON_ERROR_STOP=1 \
                         --username "$POSTGRES_USER" \
                         --dbname "$DB_NAME" \
                         -f "${f}"
                else
                    echo "No SQL files found in ${dir}"
                fi
            done
        fi
    done
done