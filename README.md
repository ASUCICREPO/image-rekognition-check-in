# Check in using Image recognition

The application serves as a facial recognition system designed to streamline identity verification processes. The workflow begins with the capture of an individual's image, typically through a camera or uploaded photograph. Using advanced facial detection algorithms provided by Amazon Rekognition, the system accurately locates and identifies the person's face within the image.

Following facial detection, the system compares the detected face against a custom-built database stored in the S3 bucket. This database contains facial embeddings or representations of known individuals, allowing for efficient and accurate recognition.

The system verifies the existence of the detected face within the database. If a match is found, it confirms the person's identity.

## Disclaimers
Customers are responsible for making their own independent assessment of the information in this document.

This document:

(a) is for informational purposes only,

(b) references AWS product offerings and practices, which are subject to change without notice,

(c) does not create any commitments or assurances from AWS and its affiliates, suppliers or licensors. AWS products or services are provided "as is" without warranties, representations, or conditions of any kind, whether express or implied. The responsibilities and liabilities of AWS to its customers are controlled by AWS agreements, and this document is not part of, nor does it modify, any agreement between AWS and its customers, and

(d) is not to be considered a recommendation or viewpoint of AWS.

Additionally, you are solely responsible for testing, security and optimizing all code and assets on GitHub repo, and all such code and assets should be considered:

(a) as-is and without warranties or representations of any kind,

(b) not suitable for production environments, or on production or other critical data, and

(c) to include shortcuts in order to support rapid prototyping such as, but not limited to, relaxed authentication and authorization and a lack of strict adherence to security best practices.

All work produced is open source. More information can be found in the GitHub repo.

## Main components of the system - 
1. S3 buckets
    - rekognition-checkin-image-store : Database of stored images
    - recognition-check-in-app : Storing all Frontend files. The `check-in-app-frontend` folder holds the entire front-end code. That can be directly uploaded to S3.
2. Cloudfront distribution - serves the frontend application through an HTTPS protected endpoint
3. DynamoDB Table - A table used to match the face ID returned from Rekognition to its corresponding ID stored in database. The primary partition key of the table is "face_id".
4. Rekognition Collection : A collection of database faces mapped by Amazon Rekognition
5. Lambda Functions
    - doppelganger_image_to_rekognition_dynamodb : Lambda function with an S3 trigger on whenever an image is added to the Image store S3 bucket. This adds the image to the Rekognition collection and the DynamoDB table. 
    - get-recognition-checkin-results: Lambda function with a function URL that is accessed by the Cloudfront distribution(web application) and returns the results to the application. 


## Steps to follow when setting up the system

### 1. Create Rekognition collection 
Create a new collection in Rekognition through CLI or re-use code in `create-rekognition-collection` folder

### 2. Create DynamoDB table
Assign face_id as partition key

### 3. Create the Image Store S3 bucket

### 4. Create the Lambda function that gets triggered by the Image store
The `doppelganger_image_to_rekognition_dynamodb` folder contains the code. Create an S3 trigger connected to the bucket above with the 'Create' event being monitored. The function should also have access to Rekognition, Dynamodb and to read S3. 


### 5. Create the Lambda function that connects to the frontend and returns result
The `get-recognition-checkin-results` folder stores the entire code that should be uploaded as zip. Create function URL for the Lambda. The function should also have access to Rekognition, and its function URL should be created granting CORS access to the Cloudfront distribution. 

### 6. Create front-end
The `check-in-app-frontend` contains the entire application frontend code. Update the Lambda function URL in `/js/app.js`.

### 7. Create Cloudfront distribution
After uploading all the files in S3, simply go to the Cloudfront UI
1. Create distribution
2. Choose the S3 bucket name endpoint as the origin domain
3. Use Origin access control settings for Origin access, and create a new OAC with signing behaviour as `Sign requests`
4. Add index.html to `Default root object` to specify the file name to redirect to when the viewer requests the root URL (/).
5. Add this Cloudfront Distribution URL as an `Allowed Origin` in the CORS for [Lambda function URL](https://github.com/ASUCICREPO/image-rekognition-check-in?tab=readme-ov-file#5-create-the-lambda-function-that-connects-to-the-frontend-and-returns-result)


### 8. Upload image to Image Store S3
The object key of the image added to S3 should be noted and an entry should be made in the “asu_celebs.py” file in get-recognition-checking-results Lambda function with the same key as ID.




## Credits

Developer: 
    [Anjali Srivastava](https://www.linkedin.com/in/anjalisrivastava/)

Sr. Solutions Architect, AWS:
    [Arun Arunachalam](https://www.linkedin.com/in/arunarunachalam/)

General Manager, ASU: 
    [Ryan Hendrix](https://www.linkedin.com/in/ryanahendrix/)

This project draws significant inspiration from the Celebrity Doppelganger concept, leveraging its existing codebase as a foundation. Building upon this framework, our team seeks to enhance and expand its capabilities with guidance and support from the [ASU Cloud Innovation Center](https://smartchallenges.asu.edu).

---------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------
