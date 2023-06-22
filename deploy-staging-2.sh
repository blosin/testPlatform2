export BRANCH_NAME=staging
export SERVICE_NAME=platform-service
REGION=us-east-2
CLUSTER=smartfran-pedidos-common
SERVICE=${SERVICE_NAME}-${BRANCH_NAME}-service
TASK=${SERVICE_NAME}-${BRANCH_NAME}-task

export IMG_TAG=ps-3.1.5
export PROJ_IMG=smartfran/${SERVICE_NAME}
export ECR_REPOSITORY=382381053403.dkr.ecr.us-east-2.amazonaws.com
export PROFILE=smartfran
export ENV=staging

# Login
$(aws ecr get-login\
        --profile ${PROFILE}\
        --no-include-email\
        --region us-east-2) 
