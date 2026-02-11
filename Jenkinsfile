pipeline {
    agent none
    stages {
        stage('Build') {
            agent {
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host' 
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            agent {
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host' 
                }
            }
            steps {
                sh 'npm run test'
            }
        }
        stage('E2E') {
            agent {
                docker { 
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host' 
                }
            }
            steps {
                sh 'npm run test:e2e'
            }
        }
        stage('Deploy to Netlify') {
            agent {
                docker { 
                    image 'node:lts-alpine'
                    args '--network=host' 
                }
            }
            when { branch 'main' }
            environment {
                NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
                NETLIFY_SITE_NAME = 'chesstpdeploiementcontinu.netlify.app' 
            }
            steps {
                sh 'npm install netlify-cli --save-dev'
                sh 'node node_modules/netlify-cli/bin/run.js deploy --prod --site $NETLIFY_SITE_NAME'
            }
        }
        stage('Docker Build & Push') {
            agent any
            when { branch 'main' }
            environment {
                CI_REGISTRY = 'ghcr.io'
                CI_REGISTRY_USER = 'vbonnifait'
                CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
                CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess-game"
            }
            steps {
                sh 'docker build -t $CI_REGISTRY_IMAGE:latest .'
                sh 'echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY'
                sh 'docker push $CI_REGISTRY_IMAGE:latest'
            }
        }
    }
}