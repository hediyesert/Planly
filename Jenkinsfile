pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Frontend Install') {
          steps {
            dir('frontend') {
              sh 'npm ci'
            }
          }
        }

        stage('Backend Install') {
          steps {
            dir('backend') {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('Quality & Build') {
      parallel {
        stage('Frontend Lint + Build') {
          steps {
            dir('frontend') {
              sh 'npm run lint'
              sh 'npm run build'
            }
          }
        }

        stage('Backend Test') {
          steps {
            dir('backend') {
              sh 'npm test'
            }
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
    }

    success {
      echo 'Pipeline başarılı.'
    }

    failure {
      echo 'Pipeline hata verdi, stage loglarını kontrol et.'
    }
  }
}