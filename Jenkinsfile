pipeline {
    agent none

    stage('Build') {
            agent { docker {
                image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                args '--network=host'
            } }
            steps {
                // Ajoute cette ligne pour nettoyer le workspace avant de commencer
                cleanWs() 
                
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Tests Unitaires') {
            agent { docker {
                image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                args '--network=host'
            } }
            steps {
                sh 'npm install'
                sh 'npm run test:run'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        icon: '', keepAll: true,
                        reportDir: 'html',
                        reportFiles: 'index.html',
                        reportName: 'VitestReport',
                        reportTitles: '',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }

        stage('Tests E2E') {
            agent { docker {
                image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                args '--network=host'
            } }
            steps {
                sh 'npm install'
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        icon: '', keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PlaywrightReport',
                        reportTitles: '',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }

        stage('Deploy Netlify') {
            agent { docker {
                image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                args '--network=host'
            } }
            when { branch 'main' }
            environment {
                NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'node_modules/netlify-cli/bin/run.js deploy --prod --dir=dist'
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