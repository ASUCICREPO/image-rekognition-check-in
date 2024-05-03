# Check in using Image recognition

The application serves as a facial recognition system designed to streamline identity verification processes. The workflow begins with the capture of an individual's image, typically through a camera or uploaded photograph. Using advanced facial detection algorithms provided by Amazon Rekognition, the system accurately locates and identifies the person's face within the image.

Following facial detection, the system compares the detected face against a custom-built database stored in the S3 bucket. This database contains facial embeddings or representations of known individuals, allowing for efficient and accurate recognition.

The system verifies the existence of the detected face within the database. If a match is found, it confirms the person's identity.


## Main components of the system - 
1. S3 buckets
    - rekognition-checkin-image-store : Database of stored images
    - recognition-check-in-app : Storing all Frontend files. The `check-in-app-frontend` folder holds the entire front-end code. That can be directly uploaded to S3.
2. Cloudfront distribution - serves the frontend application through an HTTPS protected endpoint
3. DynamoDB Table - A table used to match the face ID returned from Rekognition to its corresponding ID stored in database. The primary partition key of the table is "face_id".
4. Rekognition Collection : A collection of database faces mapped by Amazon Rekognition
5. Lambda Functions
    - doppelganger_image_to_rekognition_dynamodb : Lambda function with an S3 trigger on whenever an image is added to the Image store S3 bucket. This adds the image to the Rekognition collection and the DynamoDB table. The object key of the image added to S3 should match the ID in the entry made in the “asu_celebs.py” file in get-recognition-checkin-results Lambda function. The function should also have access to Rekognition, Dynamodb and to read S3. The `doppelganger_image_to_rekognition_dynamodb` folder contains the code
    - get-recognition-checkin-results: Lambda function with a function URL that is accessed by the Cloudfront distribution(web application) and returns the results to the application. The function should also have access to Rekognition, and its function URL should be created and Cloudfront distribution should be granted the CORS access to the Lambda function URL. The `get-recognition-checkin-results` folder stores the entire code that should be uploaded as zip


## Steps to follow when setting up the system
After uploading the files in S3, simply go to the Cloudfront UI
1. Create distribution
2. Choose the S3 bucket name endpoint as the origin domain
3. Use Origin access control settings for Origin access, and create a new OAC with signing behaviour as `Sign requests`

image-rekognition-checkin-image-store s3 bucket
create collection
create dynamodb table with face_id as partition key



get-recognition-checkin-results upload zip
give permission to recognition, create function URL, allow access from cloudfront distribution



