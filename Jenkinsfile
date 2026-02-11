pipeline {
    agent any
    environment {
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }
    stages {
        stage('Build') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Tests Unitaires') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'npm run test'
            }
        }
        stage('Tests E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'npm run test:e2e'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'node node_modules/netlify-cli/bin/run.js deploy --prod --dir=dist --site capable-malabi-fd9695.netlify.app'
            }
        }
        stage('Docker Build & Push') {
            when {
                branch 'main'
            }
            agent any
            environment {
                CI_REGISTRY = 'ghcr.io'
                CI_REGISTRY_USER = 'vbonnifait'
                CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess"
                CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
            }
            steps {
                sh 'docker build -t $CI_REGISTRY_IMAGE .'
                sh 'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY'
                sh 'docker push $CI_REGISTRY_IMAGE'
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: false,
                icon: '',
                keepAll: true,
                reportDir: 'html',
                reportFiles: 'index.html',
                reportName: 'VitestReport',
                reportTitles: '',
                useWrapperFileDirectly: true
            ])
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: false,
                icon: '',
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'PlaywrightReport',
                reportTitles: '',
                useWrapperFileDirectly: true
            ])
        }
    }
}
