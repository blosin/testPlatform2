export BRANCH_NAME=staging
export SERVICE_NAME=platform-service
REGION=us-east-2
CLUSTER=smartfran-pedidos-common
SERVICE=${SERVICE_NAME}-${BRANCH_NAME}-service
TASK=${SERVICE_NAME}-${BRANCH_NAME}-task

export IMG_TAG=ps-3.9.3
export PROJ_IMG=smartfran/${SERVICE_NAME}
export ECR_REPOSITORY=382381053403.dkr.ecr.us-east-2.amazonaws.com
export PROFILE=smartfran
export ENV=staging

# Login
$(aws ecr get-login\
        --profile ${PROFILE}\
        --no-include-email\
        --region us-east-2) 

# Build
docker build -t ${PROJ_IMG} ./api/
docker tag ${PROJ_IMG} ${ECR_REPOSITORY}/${PROJ_IMG}:${IMG_TAG}


# Push image
docker push ${ECR_REPOSITORY}/${PROJ_IMG}:${IMG_TAG}
docker rmi -f ${ECR_REPOSITORY}/${PROJ_IMG}:${IMG_TAG}

# Deploy
envsubst < container-definitions.json > ecs-container-definitions.json
aws ecs register-task-definition\
        --cli-input-json file://ecs-container-definitions.json\
        --region ${REGION}\
        --profile ${PROFILE}

aws ecs update-service\
        --cluster ${CLUSTER}\
        --service ${SERVICE}\
        --task-definition ${TASK}\
        --region ${REGION}\
        --force-new-deployment\
        --profile ${PROFILE}
