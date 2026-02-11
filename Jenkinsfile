pipeline {
    agent none
    stages {
        stage('Build') {
            agent { docker { 
              image 'mcr.microsoft.com/playwright:v1.57.0-noble'
              args '--network=host'
            } }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Tests Unitaires') {
             agent { docker { 
              image 'mcr.microsoft.com/playwright:v1.57.0-noble'
              args '--network=host'
            } }
            steps {
                sh 'npm run test'
            }
        }
        stage('Tests E2E') {
             agent { docker { 
              image 'mcr.microsoft.com/playwright:v1.57.0-noble'
              args '--network=host'
            } }
            steps {
                sh 'npm run test:e2e'
            }
        }
    }
}
