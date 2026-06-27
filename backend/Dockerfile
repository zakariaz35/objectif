# Backend Laravel — image de développement
FROM php:8.4-cli

# Dépendances système + extensions PHP (pgsql, zip, etc.)
RUN apt-get update && apt-get install -y \
        git unzip libzip-dev libpq-dev libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Installe les dépendances en couche cachée (mise en cache tant que composer.* ne change pas)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-autoloader --prefer-dist

# Code applicatif
COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8000

# Migre puis sert l'API (host 0.0.0.0 pour être joignable hors du conteneur)
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
