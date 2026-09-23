FROM php:8.4-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY ./backend /var/www

# Install composer dependencies
RUN composer install --no-interaction --optimize-autoloader --ignore-platform-reqs

# Ensure docker network hosts for DB and storage
RUN if [ -f /var/www/.env ]; then \
        sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=pgsql/' /var/www/.env && \
        sed -i 's/# DB_HOST=127.0.0.1/DB_HOST=db/' /var/www/.env && \
        sed -i 's/# DB_PORT=3306/DB_PORT=5432/' /var/www/.env && \
        sed -i 's/# DB_DATABASE=laravel/DB_DATABASE=iso21001_db/' /var/www/.env && \
        sed -i 's/# DB_USERNAME=root/DB_USERNAME=postgres/' /var/www/.env && \
        sed -i 's/# DB_PASSWORD=/DB_PASSWORD=secret/' /var/www/.env && \
        sed -i 's/FILESYSTEM_DISK=local/FILESYSTEM_DISK=public/' /var/www/.env; \
    fi

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 8000
EXPOSE 8000

# Start script: wait for postgres, migrate, seed, link storage, and start server
CMD ["sh", "-c", "php artisan config:clear && php artisan migrate --force && php artisan db:seed --force && php artisan storage:link && php artisan serve --host=0.0.0.0 --port=8000"]
