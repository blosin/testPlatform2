pipeline {
    agent {
        node {
            label 'master' 
        }
    }

    environment {
       DOCKER_REPOSITORY = "382381053403.dkr.ecr.us-east-2.amazonaws.com"
       SERVICE_NAME = "platform-service"
       PROJ_REPO = "smartfran/${SERVICE_NAME}"
       PROFILE = "smartfran"
       REGION = "us-east-2"
    }

    stages {
       
        stage('Checkout [ALL]') { 
            when { anyOf { branch 'testing'; branch 'staging'; branch 'master'; branch 'hotfixing' } }
            steps { 
                checkout scm
            }
        }

        stage ('Test:Unit [TESTING]') {
            when { anyOf { branch 'testing'; branch 'hotfixing' } }
            steps {
                script {
                    dir("${WORKSPACE}/api") {
                        sh 'rm -rf node_modules package-lock.json && npm install'
                      //  sh 'cd src/platforms/sdk/pedidosYa && rm -rf node_modules package-lock.json && npm i && cd ../../../..'
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
            when { anyOf { branch 'testing'; branch 'staging'; branch 'master'; branch 'hotfixing' } }
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
            when { anyOf { branch 'testing'; branch 'hotfixing' } }
            steps {
                dir("${WORKSPACE}/api") {
                    script {
                        env.IMAGE = docker.build('${DOCKER_REPOSITORY}/${PROJ_REPO}:${IMG_TAG}')
                    }
                }
            }
        }


           stage('Build: [STAGING]') {
            when { anyOf { branch 'staging'; branch 'hotfixing' } }
            steps {
                dir("${WORKSPACE}/api") {
                    script {
                        env.IMAGE = docker.build('${DOCKER_REPOSITORY}/${PROJ_REPO}:${IMG_TAG}')
                    }
                }
            }
        }
       /*  stage ('Test: Integration [TESTING]') {
            when { anyOf { branch 'testing'; branch 'hotfixing' } }
            steps {
                    script {
                        dir("${WORKSPACE}/api") {
                            sh "docker run -d -p 3085:3085 -e NODE_ENV=testing --name concentrador_integration_test ${DOCKER_REPOSITORY}/${PROJ_REPO}:${IMG_TAG} serve"
                            sh "docker build -t wiremock /home/ubuntu/wiremock"
                            sh "docker run -d -p 8082:8080 --name wiremock-container wiremock"
                            sh "NODE_ENV=testing npm run seed"
                            sh "npm run test:integration"
                    } 
                }
            }
        }
 */
        /* stage ('Test: Functional [TESTING]') {
            when { anyOf { branch 'testing'; branch 'hotfixing' } }
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
        } */

        stage('Push [TESTING]') {
            when { anyOf { branch 'testing'; branch 'hotfixing' } }
            steps {
                dir("${WORKSPACE}/api") {
                    script {
                        sh "\$(aws ecr get-login --profile ${PROFILE} --no-include-email --region ${REGION})"
                        sh "docker push ${DOCKER_REPOSITORY}/${PROJ_REPO}:${IMG_TAG}"
                    }
                }
            }
        }

        stage('Deploy [TESTING]') {
            when { branch 'testing'}
            environment {
                    ECS_CLUSTER = "smartfran-pedidos-common"
                    ECS_SERVICE = "${SERVICE_NAME}-${BRANCH_NAME}-service"
                    ECS_TASK = "${SERVICE_NAME}-${BRANCH_NAME}-task"
                    ECS_REGION = "us-east-2"
                }

            steps {
                script {
                    sh "envsubst < container-definitions.json > ecs-task.json"
                    sh "chmod +x ./deployCrossAccount.sh"
                    sh ". ./deployCrossAccount.sh"
                }
            }
        }

        stage('Deploy [STAGING]') {
            when { branch 'staging'}
            environment {
                ECS_CLUSTER = "smartfran-pedidos-${BRANCH_NAME}"
                ECS_SERVICE = "concentrador-pedidos-${BRANCH_NAME}-service"
                ECS_TASK = "concentrador-pedidos-${BRANCH_NAME}-task"
                ECS_REGION = "us-east-2"
            }

            steps {
                script {
                    sh "envsubst < container-definitions.json > ecs-task.json"
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
                    sh "envsubst < container-definitions-prd.json > ecs-task.json"
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
            sh "docker rmi -f ${DOCKER_REPOSITORY}/${PROJ_REPO}:${IMG_TAG} || echo fail_remove_image"
            sh "docker stop wiremock-container || echo fail_remove_container"
            sh "docker rm wiremock-container || echo fail_remove_container"
            sh "docker rmi -f wiremock || echo fail_remove_image"
            sh "docker stop functional-test-container || echo fail_remove_container"
            sh "docker rm functional-test-container  || echo fail_remove_container"
            sh "docker rmi -f functional-test || echo fail_remove_image"
            }
        }
}