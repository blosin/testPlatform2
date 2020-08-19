pipeline {
    agent {
          node {
              label 'master' 
          }
    }
    environment {
       DOCKER_REPOSITORY = "265556570017.dkr.ecr.us-west-2.amazonaws.com"
    }
    stages {
        stage('Checkout [ALL]') { 
            when { anyOf { branch 'testing'; branch 'staging'; branch 'master' } }
            steps { 
                checkout scm
            }
        }

        stage ('Test:Unit [TESTING]') {
            when { branch 'testing'}
            steps {
                script {
                    dir("${WORKSPACE}/api") {
                        sh 'rm -rf node_modules package-lock.json && npm install'
                        sh 'cd src/platforms/sdk/pedidosYa && rm -rf node_modules package-lock.json && npm i && cd ../../../..'
                        sh 'npm run test:coverage' 
                    }
                }
            }
        }

        stage ('Test:Static [TESTING]') {
            when { branch 'testing'}
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'node') {
                        dir("${WORKSPACE}/api") {
                            sh "${HOME}/sonar-scanner-4.2.0.1873-linux/bin/sonar-scanner"
                        }
                    }
                }
            }
        }

        stage ('Get version'){
            when { anyOf { branch 'testing'; branch 'staging'; branch 'master' } }
            steps {
                script {
                    dir("${WORKSPACE}") {
                        def CHLOG = readFile "./changelog.md"
                        def VERSION = CHLOG =~ /.*\[(.*)\]/
                        env.IMG_TAG = VERSION[0][1]
                    }
                }
            }
        }

        stage('Build: [TESTING]') {
           when { branch 'testing'}
            steps {
                dir("${WORKSPACE}/api") {
                    script {
                        env.IMAGE = docker.build('${DOCKER_REPOSITORY}/smartfran/api:${IMG_TAG}')
                    }
                }
            }
        }
       stage ('Test: Integration [TESTING]') {
            when { branch 'testing'}
            steps {
                 script {
                        dir("${WORKSPACE}/api") {
                            sh "docker run -d -p 3085:3085 -e NODE_ENV=testing --name concentrador_integration_test ${DOCKER_REPOSITORY}/smartfran/api:${IMG_TAG} serve"
                            sh "docker build -t wiremock /home/ubuntu/wiremock"
                            sh "docker run -d -p 8082:8080 --name wiremock-container wiremock"
                            sh "NODE_ENV=testing npm run seed"
                            sh "npm run test:integration"
                    } 
                }
            }
        }

        stage ('Test: Functional [TESTING]') {
            when { branch 'testing'}
            steps {
                 script {
                    dir("${WORKSPACE}/api/test/functional") {
                        try {
                                sh "docker build -t functional-test ."
                                sh "docker run --name functional-test-container functional-test"
                            }
                            catch (Exception ex) {
    
                            }
                        } 
                }
            }
        }

         stage('Push [TESTING]') {
           when { branch 'testing'}
            steps {
                dir("${WORKSPACE}/api") {
                    script {
                        sh "\$(aws ecr get-login --no-include-email --region us-west-2)"
                        sh "docker push ${DOCKER_REPOSITORY}/smartfran/api:${IMG_TAG}"
                    }
                }
            }
        }

        stage('Deploy [TESTING]') {
            when { branch 'testing'}
            steps {
                script {
                    sh "envsubst < container-definitions-template-testing.json > container-definitions.json"
                    sh "aws ecs register-task-definition --cli-input-json file://${WORKSPACE}/container-definitions.json --region us-east-2"
                    sh "aws ecs update-service --cluster testing-projects --service smartfran-api-testing-service --task-definition smartfran-api-testing-task --force-new-deployment --region us-east-2"
                }
            }
        }

        stage('Deploy [STAGING]') {
           when { branch 'staging'}
            environment {
                ECS_CLUSTER = "smartfran-pedidos-staging"
                ECS_SERVICE = "concentrador-pedidos-staging-service"
                ECS_TASK = "concentrador-pedidos-staging-task"
                ECS_REGION = "us-east-1"
            }

            steps {
                script {
                    sh "envsubst < container-definitions-template-staging.json > container-definitions.json"
                    sh "chmod +x ./deployCrossAccount.sh"
                    sh ". ./deployCrossAccount.sh"
                }
            }
        }

        stage('Deploy [PRODUCTION]') {
            when { branch 'master'}

            environment {
                ECS_CLUSTER = "smartfran-pedidos-production"
                ECS_SERVICE = "concentrador-pedidos-production-service"
                ECS_TASK = "concentrador-pedidos-production-task"
                ECS_REGION = "us-east-1"
            }

            steps {
                    script {
                    sh "envsubst < container-definitions-template-production.json > container-definitions.json"
                    sh "chmod +x ./deployCrossAccount.sh"
                    sh ". ./deployCrossAccount.sh"
                    }
            }
        }
        
    }
    post {
        always {
            sh "docker stop concentrador_integration_test || echo fail_remove_container"
            sh "docker rm concentrador_integration_test || echo fail_remove_container"
            sh "docker rmi -f ${DOCKER_REPOSITORY}/smartfran/api:${IMG_TAG} || echo fail_remove_image"
            sh "docker stop wiremock-container || echo fail_remove_container"
            sh "docker rm wiremock-container || echo fail_remove_container"
            sh "docker rmi -f wiremock || echo fail_remove_image"
            sh "docker stop functional-test-container || echo fail_remove_container"
            sh "docker rm functional-test-container  || echo fail_remove_container"
            sh "docker rmi -f functional-test || echo fail_remove_image"
            }
        }
}