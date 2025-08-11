#!/bin/bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Script d'initialisation       ${NC}"
    echo -e "${BLUE}  TemplateNextGen               ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Fonction pour vérifier si curl est installé
check_curl() {
    if ! command -v curl &> /dev/null; then
        print_error "curl n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
}

# Fonction pour se connecter à l'API et obtenir un token
login_to_api() {
    local api_url=$1

    print_message "Connexion à l'API SpleenDB..." >&2
    print_message "URL de l'API: $api_url" >&2
    print_message "Tentative de connexion avec admin@admin.com..." >&2

    # Test de connectivité d'abord (avec gestion des redirections)
    print_message "Test de connectivité à l'API..." >&2
    if ! curl -s -L --connect-timeout 10 --max-time 30 "$api_url" > /dev/null 2>&1; then
        print_error "Impossible de se connecter à l'API" >&2
        print_error "Vérifiez que l'URL $api_url est accessible" >&2
        print_error "Vérifiez votre connexion internet" >&2
        return 1
    fi

    print_message "Connectivité OK, tentative d'authentification..." >&2

    # Appel curl pour se connecter avec plus de détails (avec gestion des redirections)
    response=$(curl -s -L -w "HTTP_CODE:%{http_code}|TIME:%{time_total}|SIZE:%{size_download}|" -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: InitializeScript/1.0" \
        --connect-timeout 10 \
        --max-time 30 \
        -d '{
            "email": "admin@admin.com",
            "password": "password"
        }' \
        "$api_url/auth/login")

    # Extraire les informations de la réponse
    http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
    time_total=$(echo "$response" | grep -o 'TIME:[0-9.]*' | cut -d':' -f2)
    size_download=$(echo "$response" | grep -o 'SIZE:[0-9]*' | cut -d':' -f2)
    response_body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*|TIME:[0-9.]*|SIZE:[0-9]*|//')

    print_message "Temps de réponse: ${time_total}s"
    print_message "Taille de la réponse: ${size_download} bytes"
    print_message "Code de statut HTTP: $http_code"

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        # Extraire le token JWT de la réponse JSON (format: token.token)
        token=$(echo "$response_body" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            print_message "Connexion réussie! Token obtenu."
            print_message "Token (premiers caractères): ${token:0:20}..."
            # Nettoyer le token de tout caractère parasite
            token=$(echo "$token" | tr -d '\n\r\t ')
            # Retourner seulement le token sur stdout
            echo "$token"
        else
            print_error "Impossible d'extraire le token de la réponse"
            print_error "Réponse complète: $response_body"
            print_error "Format de réponse détecté: token dans un objet imbriqué"
            return 1
        fi
    else
        print_error "Erreur lors de la connexion"
        print_error "Code HTTP: $http_code"
        print_error "Réponse complète: $response_body"

        case $http_code in
            401)
                print_error "Erreur 401: Identifiants incorrects (admin@admin.com/password)"
                ;;
            404)
                print_error "Erreur 404: Endpoint /auth/login non trouvé"
                print_error "Vérifiez que l'URL de l'API est correcte"
                ;;
            500)
                print_error "Erreur 500: Erreur interne du serveur"
                ;;
            502|503|504)
                print_error "Erreur $http_code: Serveur temporairement indisponible"
                ;;
            *)
                print_error "Erreur HTTP inconnue: $http_code"
                ;;
        esac
        return 1
    fi
}

# Fonction pour créer le bot MySQL
create_mysql_bot() {
    local api_url=$1
    local token=$2
    local db_name=$3
    local db_user=$4
    local db_password=$5

    print_message "=== DÉBUT FONCTION create_mysql_bot ==="
    print_message "Paramètres reçus:"
    print_message "  - api_url: $api_url"
    print_message "  - token: ${token:0:20}..."
    print_message "  - db_name: $db_name"
    print_message "  - db_user: $db_user"
    print_message "  - db_password: ${db_password:0:5}..."
    print_message "Création du bot MySQL pour la base de données '$db_name'..."

    # Construire les variables d'environnement JSON (format MySQL attendu par l'API)
    env_vars="{\"MYSQL_PORT\":\"$db_port\",\"MYSQL_USER\":\"$db_user\",\"MYSQL_PASSWORD\":\"$db_password\",\"MYSQL_DATABASE\":\"$db_name\",\"MYSQL_ROOT_PASSWORD\":\"$db_password\"}"

    # Appel curl pour créer le bot avec plus de détails
    print_message "Envoi de la requête de création du bot..."
    print_message "Variables d'environnement: $env_vars"
    print_message "Token complet: $token"

    # Construire le JSON de la requête
    request_json="{
        \"name\": \"BotMySQL_$db_name\",
        \"description\": \"Bot pour connexion MySQL - $db_name\",
        \"version\": \"1.0.0\",
        \"launch_command\": \"echo \\\"Bot MySQL pour $db_name créé\\\"\",
        \"type\": \"mysql\",
        \"environment_variables\": $env_vars
    }"

    print_message "JSON de la requête: $request_json"

    response=$(curl -s -L -w "HTTP_CODE:%{http_code}|TIME:%{time_total}|SIZE:%{size_download}|" -X POST \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -H "User-Agent: InitializeScript/1.0" \
        --connect-timeout 10 \
        --max-time 30 \
        -d "$request_json" \
        "$api_url/bots")

    # Extraire les informations de la réponse
    http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
    time_total=$(echo "$response" | grep -o 'TIME:[0-9.]*' | cut -d':' -f2)
    size_download=$(echo "$response" | grep -o 'SIZE:[0-9]*' | cut -d':' -f2)
    response_body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*|TIME:[0-9.]*|SIZE:[0-9]*|//')

    print_message "Temps de réponse: ${time_total}s"
    print_message "Taille de la réponse: ${size_download} bytes"
    print_message "Code de statut HTTP: $http_code"

        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        # Extraire l'ID du bot de la réponse JSON
        bot_id=$(echo "$response_body" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        if [ -n "$bot_id" ]; then
            print_message "Bot MySQL créé avec succès! ID: $bot_id"
            print_message "=== FIN FONCTION create_mysql_bot (SUCCÈS) ==="
            echo "$bot_id"
        else
            print_error "Impossible d'extraire l'ID du bot de la réponse"
            print_error "Réponse complète: $response_body"
            print_error "Format de réponse attendu: {\"id\":123,\"name\":\"...\",...}"
            return 1
        fi
    else
        print_error "Erreur lors de la création du bot"
        print_error "Code HTTP: $http_code"
        print_error "Réponse complète: $response_body"
        print_error "Token utilisé: ${token:0:20}..."
        print_error "URL de l'API: $api_url/bots"
        print_error "Variables d'environnement envoyées: $env_vars"

        case $http_code in
            401)
                print_error "Erreur 401: Token d'authentification invalide ou expiré"
                print_error "Le token a peut-être expiré, essayez de relancer le script"
                ;;
            400)
                print_error "Erreur 400: Données de requête invalides"
                print_error "Vérifiez le format des variables d'environnement"
                print_error "JSON envoyé: $env_vars"
                ;;
            404)
                print_error "Erreur 404: Endpoint /bots non trouvé"
                print_error "Vérifiez que l'URL de l'API est correcte: $api_url"
                ;;
            422)
                print_error "Erreur 422: Données de validation échouées"
                print_error "Le serveur a rejeté les données envoyées"
                print_error "Vérifiez le format des champs requis"
                ;;
            500)
                print_error "Erreur 500: Erreur interne du serveur"
                print_error "Le serveur a rencontré une erreur interne"
                ;;
            502|503|504)
                print_error "Erreur $http_code: Serveur temporairement indisponible"
                print_error "Essayez de relancer le script dans quelques minutes"
                ;;
            *)
                print_error "Erreur HTTP inconnue: $http_code"
                print_error "Code de statut non reconnu"
                ;;
        esac
        print_message "=== FIN FONCTION create_mysql_bot (ERREUR) ==="
        return 1
    fi
}

# Fonction pour configurer les variables d'environnement
setup_environment() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    local db_port=$4
    local bot_id=$5

    print_message "Configuration des variables d'environnement..."

    # Créer le fichier .env s'il n'existe pas
    if [ ! -f ".env" ]; then
        touch .env
        print_message "Fichier .env créé"
    fi

    # Ajouter ou mettre à jour les variables de base de données
    if grep -q "DB_NAME" .env; then
        sed -i.bak "s/DB_NAME=.*/DB_NAME=$db_name/" .env
    else
        echo "DB_NAME=$db_name" >> .env
    fi

    if grep -q "DB_USER" .env; then
        sed -i.bak "s/DB_USER=.*/DB_USER=$db_user/" .env
    else
        echo "DB_USER=$db_user" >> .env
    fi

    if grep -q "DB_PASSWORD" .env; then
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env
    else
        echo "DB_PASSWORD=$db_password" >> .env
    fi

    if grep -q "DB_PORT" .env; then
        sed -i.bak "s/DB_PORT=.*/DB_PORT=$db_port/" .env
    else
        echo "DB_PORT=$db_port" >> .env
    fi

    if grep -q "BOT_ID" .env; then
        sed -i.bak "s/BOT_ID=.*/BOT_ID=$bot_id/" .env
    else
        echo "BOT_ID=$bot_id" >> .env
    fi

    # Nettoyer le fichier de sauvegarde
    if [ -f ".env.bak" ]; then
        rm .env.bak
    fi

    print_message "Variables d'environnement configurées"
}

# Fonction pour configurer le fichier .env du serveur
setup_server_env() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    local db_port=$4

    print_message "Configuration du fichier .env du serveur..."

    # Vérifier si le fichier .env.example existe dans le dossier server
    if [ ! -f "server/.env.example" ]; then
        print_error "Le fichier server/.env.example n'existe pas"
        print_error "Veuillez créer ce fichier avec les variables d'environnement de base"
        return 1
    fi

    # Copier .env.example vers .env dans le dossier server
    cp "server/.env.example" "server/.env"
    print_message "Fichier .env créé à partir de .env.example"

    # Configurer les variables de base de données dans le fichier .env du serveur
    if grep -q "DB_HOST" server/.env; then
        sed -i.bak "s/DB_HOST=.*/DB_HOST=spleendb.fr/" server/.env
    fi

    if grep -q "DB_PORT" server/.env; then
        sed -i.bak "s/DB_PORT=.*/DB_PORT=$db_port/" server/.env
    fi

    if grep -q "DB_USER" server/.env; then
        sed -i.bak "s/DB_USER=.*/DB_USER=$db_user/" server/.env
    fi

    if grep -q "DB_PASSWORD" server/.env; then
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" server/.env
    fi

    if grep -q "DB_DATABASE" server/.env; then
        sed -i.bak "s/DB_DATABASE=.*/DB_DATABASE=$db_name/" server/.env
    fi

    # Nettoyer le fichier de sauvegarde
    if [ -f "server/.env.bak" ]; then
        rm "server/.env.bak"
    fi

    print_message "Fichier .env du serveur configuré avec succès"
}

# Fonction pour générer un port aléatoire
generate_random_port() {
    # Générer un port aléatoire entre 10000 et 65535
    # Ces ports sont généralement libres et non réservés
    echo $((10000 + RANDOM % 55535))
}

# Fonction pour générer un mot de passe sécurisé
generate_password() {
    # Générer un mot de passe de 16 caractères avec lettres, chiffres et symboles
    openssl rand -base64 12 | tr -d "=+/" | cut -c1-16
}

# Fonction principale
main() {
    print_header

    # Vérifier que curl est installé
    check_curl

        # Demander le nom du projet
    echo -e "${YELLOW}Entrez le nom du projet:${NC}"
    read -r project_name

    # Vérifier que le nom du projet n'est pas vide
    if [ -z "$project_name" ]; then
        print_error "Le nom du projet ne peut pas être vide"
        exit 1
    fi

    # Convertir en minuscules et remplacer les caractères spéciaux
    db_user=$(echo "$project_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g')
    db_name="$db_user"

    print_message "Nom du projet: $project_name"
    print_message "Utilisateur de base de données: $db_user"
    print_message "Nom de la base de données: $db_name"

    # Générer un mot de passe sécurisé
    db_password=$(generate_password)
    print_message "Mot de passe généré automatiquement: $db_password"

    # Générer un port aléatoire
    db_port=$(generate_random_port)
    print_message "Port généré automatiquement: $db_port"

    # URL de l'API SpleenDB (avec HTTPS et gestion des redirections)
    api_url="https://spleendb.fr/api"
    print_message "Utilisation de l'API SpleenDB: $api_url"

            # Se connecter à l'API
    print_message "Étape 1/3: Connexion à l'API..."

    # Capturer le token proprement (dernière ligne de la sortie)
    login_output=$(login_to_api "$api_url" 2>&1)
    login_exit_code=$?

    if [ $login_exit_code -ne 0 ]; then
        print_error "Échec de la connexion à l'API"
        echo "$login_output"
        exit 1
    fi

    # Extraire le token de la dernière ligne
    token=$(echo "$login_output" | tail -1 | tr -d '\n\r\t ')
    print_message "✅ Connexion à l'API réussie"
    print_message "Token extrait: ${token:0:20}..."

        # Créer le bot MySQL (sans host spécifique)
    print_message "Étape 2/3: Création du bot MySQL..."
    print_message "Paramètres: API=$api_url, DB=$db_name, USER=$db_user"

    # Vérifier que le token est valide
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Token invalide ou vide"
        exit 1
    fi

    print_message "Token validé: ${token:0:20}..."

    # Capturer la sortie et le code de retour
    bot_result=$(create_mysql_bot "$api_url" "$token" "$db_name" "$db_user" "$db_password" 2>&1)
    bot_exit_code=$?

    if [ $bot_exit_code -ne 0 ]; then
        print_error "Échec de la création du bot MySQL"
        print_error "Code de retour: $bot_exit_code"
        print_error "Sortie de la fonction:"
        echo "$bot_result"
        exit 1
    fi

    bot_id="$bot_result"
    print_message "✅ Bot MySQL créé avec succès, ID: $bot_id"

    # Configurer les variables d'environnement
    print_message "Étape 3/3: Configuration des variables d'environnement..."
    setup_environment "$db_name" "$db_user" "$db_password" "$db_port" "$bot_id"
    print_message "✅ Variables d'environnement configurées"

    # Configurer le fichier .env du serveur
    print_message "Étape 4/4: Configuration du fichier .env du serveur..."
    setup_server_env "$db_name" "$db_user" "$db_password" "$db_port"
    print_message "✅ Fichier .env du serveur configuré"

    print_message "Initialisation terminée avec succès!"
    echo ""
    echo -e "${GREEN}Résumé:${NC}"
    echo -e "  - Nom de la base de données: $db_name"
    echo -e "  - Utilisateur MySQL: $db_user"
    echo -e "  - Mot de passe MySQL: $db_password"
    echo -e "  - Port MySQL: $db_port"
    echo -e "  - URL de l'API: $api_url"
    echo -e "  - ID du bot créé: $bot_id"
    echo -e "  - Variables d'environnement configurées dans .env"
    echo -e "  - Fichier .env du serveur configuré dans server/.env"
    echo ""
    echo -e "${YELLOW}Commandes utiles pour gérer le bot:${NC}"
    echo -e "  - Démarrer le bot: curl -X POST $api_url/bots/$bot_id/start -H \"Authorization: Bearer $token\""
    echo -e "  - Arrêter le bot: curl -X POST $api_url/bots/$bot_id/stop -H \"Authorization: Bearer $token\""
    echo -e "  - Voir les logs: curl -X GET $api_url/bots/$bot_id/logs -H \"Authorization: Bearer $token\""
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Sauvegardez le mot de passe généré !${NC}"
}

# Exécuter la fonction principale
main "$@"
