pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/hediyesert/Planly.git'
            }
        }

        stage('Prepare Env') {
             steps {
                sh 'cp backend/.env.example backend/.env'
            }
}
        stage('Build and Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }
}