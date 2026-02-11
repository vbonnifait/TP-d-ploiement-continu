pipeline {
    agent any
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
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                withCredentials([string(credentialsId: 'netlify-token', variable: 'NETLIFY_AUTH_TOKEN')]) {
                    sh 'node node_modules/netlify-cli/bin/run.js deploy --prod --dir=dist --site capable-malabi-fd9695.netlify.app'
                }
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
