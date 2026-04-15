pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Buraya KENDİ GitHub repo linkini yaz
                git branch: 'main', url: 'https://github.com/hediyesert/Planly.git' [cite: 269]
            }
        }
        stage('Build and Deploy') {
            steps {
                // npm komutlarını sildik, yerine docker compose yazdık [cite: 274, 275]
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }
}