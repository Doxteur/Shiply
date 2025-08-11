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
    echo -e "${BLUE}  Script de déploiement Docker  ${NC}"
    echo -e "${BLUE}  TemplateNextGen              ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Fonction pour vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        exit 1
    fi

    # Vérifier si docker compose fonctionne
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé ou ne fonctionne pas"
        exit 1
    fi

    print_message "✅ Docker et Docker Compose sont installés"
}

# Fonction pour vérifier les variables d'environnement
check_env() {
    if [ ! -f "server/.env" ]; then
        print_warning "Le fichier server/.env n'existe pas"
        print_message "Veuillez d'abord exécuter Initialize.sh pour créer le fichier .env"
        print_message "Ou créez manuellement le fichier server/.env avec les variables suivantes :"
        echo "NODE_ENV=production"
        echo "PORT=3333"
        echo "HOST=0.0.0.0"
        echo "LOG_LEVEL=info"
        echo "APP_KEY=uUR_gG7cmFO8W4aEuDkT7i2gpwrgLQBA"
        echo "DB_HOST=spleendb.fr"
        echo "DB_PORT=3306"
        echo "DB_USER=your_db_user"
        echo "DB_PASSWORD=your_db_password"
        echo "DB_DATABASE=your_db_name"
        exit 1
    else
        print_message "✅ Fichier server/.env trouvé"
    fi
}

# Fonction pour construire et démarrer les services
deploy() {
    print_message "Construction et démarrage des services..."

    # Arrêter les services existants
    docker compose down

    # Construire les images
    docker compose build --no-cache

    # Démarrer les services
    docker compose up -d

    if [ $? -eq 0 ]; then
        print_message "✅ Services démarrés avec succès"
    else
        print_error "❌ Erreur lors du démarrage des services"
        exit 1
    fi
}

# Fonction pour afficher les logs
show_logs() {
    print_message "Affichage des logs..."
    docker compose logs -f
}

# Fonction pour arrêter les services
stop_services() {
    print_message "Arrêt des services..."
    docker compose down
    print_message "✅ Services arrêtés"
}

# Fonction principale
main() {
    print_header

    # Vérifier Docker
    check_docker

    # Vérifier les variables d'environnement
    check_env

    # Menu principal
    echo -e "${YELLOW}Choisissez une action :${NC}"
    echo -e "  1. Déployer (construire et démarrer)"
    echo -e "  2. Voir les logs"
    echo -e "  3. Arrêter les services"
    echo -e "  4. Redémarrer les services"
    echo -e "  5. Quitter"
    read -r choice

    case $choice in
        1)
            deploy
            print_message "🎉 Déploiement terminé!"
            echo ""
            echo -e "${GREEN}Services disponibles :${NC}"
            echo -e "  - API: http://localhost:3333"
            echo -e "  - Client: http://localhost:3000"
            echo -e "  - Nginx (proxy): http://localhost:80"
            ;;
        2)
            show_logs
            ;;
        3)
            stop_services
            ;;
        4)
            stop_services
            deploy
            ;;
        5)
            print_message "Au revoir!"
            exit 0
            ;;
        *)
            print_error "Choix invalide"
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale
main "$@"
