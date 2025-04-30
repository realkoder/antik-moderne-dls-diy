#!/bin/bash

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