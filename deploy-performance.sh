REGION=us-west-2
export BUILD_TAG=per-3.0.3
export PROJ_IMG=smartfran/platform-service
export ECR_REPOSITORY=382381053403.dkr.ecr.us-east-2.amazonaws.com
export PROFILE=smartfran
export ENV=performance
# Login
$(aws ecr get-login\
        --profile ${PROFILE}\
        --no-include-email\
        --region us-east-2)
# Build
docker build -t ${PROJ_IMG} ./api/
docker tag ${PROJ_IMG} ${ECR_REPOSITORY}/${PROJ_IMG}:${BUILD_TAG}
# Push image
docker push ${ECR_REPOSITORY}/${PROJ_IMG}:${BUILD_TAG}
docker rmi -f ${ECR_REPOSITORY}/${PROJ_IMG}:${BUILD_TAG}
# Deploy
envsubst < container-definitions-prd.json > ecs-container-definitions.json
aws ecs register-task-definition\
        --cli-input-json file://ecs-container-definitions.json\
        --region ${REGION}\
        --profile ${PROFILE}
aws ecs update-service\
        --cluster smartfran-pedidos-performance\
        --service platform-service-performance-service\
        --task-definition platform-service-performance-task\
        --region ${REGION}\
        --force-new-deployment\
        --profile ${PROFILE}