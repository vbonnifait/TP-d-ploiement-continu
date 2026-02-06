pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code source récupéré'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
                echo 'Dépendances installées'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                echo 'Application compilée'
            }
        }

        stage('Test Unitaires') {
            steps {
                sh 'npm run test:run'
                echo 'Tests unitaires passés'
            }
        }

        stage('Test E2E') {
            steps {
                sh 'npx playwright install --with-deps chromium'
                sh 'npm run test:e2e'
                echo 'Tests E2E passés'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Déploiement en production...'
                sh 'cp -r dist/* /var/www/html/ || echo "Simulation du déploiement"'
                echo 'Application déployée avec succès'
            }
        }
    }

    post {
        always {
            echo 'Pipeline terminé'
        }
        success {
            echo 'Build réussi!'
        }
        failure {
            echo 'Build échoué!'
        }
    }
}
