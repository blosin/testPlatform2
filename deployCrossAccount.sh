unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
response=$(aws sts assume-role --role-arn arn:aws:iam::382381053403:role/Ross_Jenkins_CrossAccount_Role --role-session-name smartfran )
export AWS_SECRET_ACCESS_KEY=$(echo $response | jq .Credentials.SecretAccessKey -r)
export AWS_ACCESS_KEY_ID=$(echo $response | jq .Credentials.AccessKeyId -r)
export AWS_SESSION_TOKEN=$(echo $response | jq .Credentials.SessionToken -r)
env | grep AWS

aws ecs register-task-definition \
        --cli-input-json file://${WORKSPACE}/ecs-task.json \
        --region ${ECS_REGION}

aws ecs update-service \
        --cluster ${ECS_CLUSTER} \
        --service ${ECS_SERVICE} \
        --task-definition ${ECS_TASK} \
        --region ${ECS_REGION} \
        --force-new-deployment