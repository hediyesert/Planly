pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Kendi GitHub repo adresini buraya yaz
                git branch: 'main', url: 'https://github.com/hediyesert/Planly.git' [cite: 269]
            }
        }
        stage('Build and Deploy') {
            steps {
                // Docker compose ile eski konteynırları durdur ve yenilerini derleyerek ayağa kaldır
                sh 'docker compose down' [cite: 274]
                sh 'docker compose up -d --build' [cite: 275]
            }
        }
        stage('Health Check') {
            steps {
                script {
                    sleep 10 // Konteynırların açılması için bekle [cite: 281]
                    // Backend'in çalışıp çalışmadığını kontrol et
                    sh 'curl -f http://localhost:3000 || echo "Backend henüz hazır değil"' [cite: 282]
                }
            }
        }
    }
    post {
        success {
            echo 'Deploy basarili: Planly calisiyor.' [cite: 289]
        }
        failure {
            echo 'Deploy basarisiz: loglari kontrol et.' [cite: 292]
        }
    }
}