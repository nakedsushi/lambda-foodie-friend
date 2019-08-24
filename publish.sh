#!/bin/bash

cd lambda
zip -X -r ../src.zip .
cd ..
echo "Uploading lambda to AWS..."
aws lambda update-function-code --function-name FoodieFriendWrite  --zip-file fileb://src.zip
rm src.zip
